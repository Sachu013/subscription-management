const Subscription = require('../models/subscriptionModel');
const {
    getSubscriptionStatus,
    isActiveInMonth,
    getNormalizedMonthlyCost,
    getTotalAmountSpent
} = require('../utils/subscriptionUtils');

// Helper to get filtered subscriptions for analytics
const getFilteredSubscriptions = async (req) => {
    const { status, category, search, billingCycle, minPrice, maxPrice } = req.query;
    let query = { user: req.user.id };

    // Search by name (case-insensitive)
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    // Category filter (if not "All")
    if (category && category !== 'All') {
        query.category = category;
    }

    // Billing Cycle filter (if not "All")
    if (billingCycle && billingCycle !== 'All') {
        query.billingCycle = billingCycle;
    }

    // Price range filter
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let subscriptions = await Subscription.find(query);

    if (status && status !== 'All') {
        subscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === status);
    }

    return subscriptions;
};

// ==================== ANALYTICS ENDPOINTS ====================

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
// @access  Private
const getAnalyticsSummary = async (req, res) => {
    try {
        const subscriptions = await getFilteredSubscriptions(req);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let activeCount = 0;
        let expiredCount = 0;
        let upcomingCount = 0;
        let monthlyTotal = 0;
        let allTimeTotal = 0;

        subscriptions.forEach(sub => {
            const subObj = sub.toObject();
            const status = getSubscriptionStatus(subObj);
            const totalSpent = getTotalAmountSpent(subObj);

            allTimeTotal += totalSpent;

            if (status === 'Active') activeCount++;
            else if (status === 'Expired') expiredCount++;
            else if (status === 'Upcoming') upcomingCount++;

            // Sum payments in current month
            if (sub.payments) {
                sub.payments.forEach(p => {
                    const pDate = new Date(p.paidOn);
                    if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
                        monthlyTotal += p.amount;
                    }
                });
            }
        });

        res.status(200).json({
            activeCount,
            expiredCount,
            upcomingCount,
            totalCount: subscriptions.length,
            monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
            allTimeTotal: parseFloat(allTimeTotal.toFixed(2))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get category-wise breakdown
// @route   GET /api/analytics/category-breakdown?filter=all_time|active_only|current_month
// @access  Private
const getCategoryBreakdown = async (req, res) => {
    try {
        const filter = req.query.filter || 'all_time';
        const subscriptions = await getFilteredSubscriptions(req);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let filteredSubscriptions = subscriptions;

        if (filter === 'active_only') {
            filteredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'Active');
        } else if (filter === 'current_month') {
            filteredSubscriptions = subscriptions.filter(sub => isActiveInMonth(sub, currentMonth, currentYear));
        }

        const categoryMap = {};

        filteredSubscriptions.forEach(sub => {
            const category = sub.category || 'Other';
            // Cost depends on filter. For all_time, it's total spending. 
            // For current_month, it's payments IN that month.
            let costToAdd = 0;
            if (filter === 'current_month') {
                if (sub.payments) {
                    sub.payments.forEach(p => {
                        const pDate = new Date(p.paidOn);
                        if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
                            costToAdd += (p.amount || 0);
                        }
                    });
                }
            } else {
                costToAdd = getTotalAmountSpent(sub);
            }

            if (categoryMap[category]) {
                categoryMap[category] += costToAdd;
            } else {
                categoryMap[category] = costToAdd;
            }
        });

        const breakdown = Object.keys(categoryMap).map(cat => ({
            name: cat,
            value: parseFloat(categoryMap[cat].toFixed(2))
        })).sort((a, b) => b.value - a.value);

        res.status(200).json(breakdown);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get monthly expenses trend (last 6 months)
// @route   GET /api/analytics/monthly-expenses
// @access  Private
const getMonthlyExpenses = async (req, res) => {
    try {
        const subscriptions = await getFilteredSubscriptions(req);
        const monthlyData = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.getMonth();
            const year = d.getFullYear();
            const monthName = d.toLocaleString('default', { month: 'short' });

            let monthlyTotal = 0;

            subscriptions.forEach(sub => {
                if (sub.payments) {
                    sub.payments.forEach(p => {
                        const pDate = new Date(p.paidOn);
                        if (pDate.getMonth() === month && pDate.getFullYear() === year) {
                            monthlyTotal += p.amount;
                        }
                    });
                }
            });

            monthlyData.push({
                month: monthName,
                amount: parseFloat(monthlyTotal.toFixed(2))
            });
        }

        res.status(200).json(monthlyData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get top subscriptions by cost
// @route   GET /api/analytics/top-subscriptions?limit=5&filter=allTime|activeOnly|expiredOnly
// @access  Private
const getTopSubscriptions = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const filter = req.query.filter || 'allTime';
        // Use global filters first, then specific ones
        const subscriptions = await getFilteredSubscriptions(req);

        let filteredSubscriptions = subscriptions;
        if (filter === 'activeOnly') {
            filteredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'Active');
        } else if (filter === 'expiredOnly') {
            filteredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'Expired');
        }

        const subscriptionsWithTotalCost = filteredSubscriptions.map(sub => {
            const price = sub.price !== undefined ? sub.price : (sub.cost !== undefined ? sub.cost : 0);
            return {
                _id: sub._id,
                name: sub.name,
                category: sub.category,
                price: price,
                billingCycle: sub.billingCycle,
                totalSpent: getTotalAmountSpent(sub)
            };
        });

        const topSubscriptions = subscriptionsWithTotalCost
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, limit);

        res.status(200).json(topSubscriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get category comparison
// @route   GET /api/analytics/category-comparison/:category
// @access  Private
const getCategoryComparison = async (req, res) => {
    try {
        const category = req.params.category;
        const subscriptions = await Subscription.find({
            user: req.user.id,
            category: category
        });

        // Use dynamic active status
        const activeSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'Active');

        const comparisonData = activeSubscriptions.map(sub => {
            const price = sub.price !== undefined ? sub.price : (sub.cost !== undefined ? sub.cost : 0);
            const monthlyCost = getNormalizedMonthlyCost(sub);

            return {
                _id: sub._id,
                name: sub.name,
                price: price,
                billingCycle: sub.billingCycle,
                monthlyCost: parseFloat(monthlyCost.toFixed(2)),
                totalSpent: getTotalAmountSpent(sub),
                startDate: sub.startDate
            };
        }).sort((a, b) => b.totalSpent - a.totalSpent);

        res.status(200).json(comparisonData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAnalyticsSummary,
    getCategoryBreakdown,
    getMonthlyExpenses,
    getTopSubscriptions,
    getCategoryComparison
};
