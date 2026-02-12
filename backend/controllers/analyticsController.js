const Subscription = require('../models/subscriptionModel');
const {
    getSubscriptionStatus,
    isActiveInMonth,
    getNormalizedMonthlyCost,
    getTotalAmountSpent
} = require('../utils/subscriptionUtils');

// ==================== ANALYTICS ENDPOINTS ====================

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
// @access  Private
const getAnalyticsSummary = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user.id });
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
        const subscriptions = await Subscription.find({ user: req.user.id });
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
                categoryMap[category].total += costToAdd;
                categoryMap[category].count += 1;
            } else {
                categoryMap[category] = {
                    total: costToAdd,
                    count: 1
                };
            }
        });

        const categoryData = Object.keys(categoryMap).map(category => ({
            name: category,
            value: parseFloat(categoryMap[category].total.toFixed(2)),
            count: categoryMap[category].count
        })).sort((a, b) => b.value - a.value);

        res.status(200).json(categoryData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get monthly spending trend (last 12 months)
// @route   GET /api/analytics/monthly-trend
// @access  Private
const getMonthlyTrend = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user.id });
        const monthlyData = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = date.getMonth();
            const year = date.getFullYear();
            const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });

            let monthlyTotal = 0;
            subscriptions.forEach(sub => {
                if (sub.payments) {
                    sub.payments.forEach(p => {
                        const pDate = new Date(p.paidOn);
                        if (pDate.getMonth() === month && pDate.getFullYear() === year) {
                            monthlyTotal += (p.amount || 0);
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
        const subscriptions = await Subscription.find({ user: req.user.id });

        let filteredSubscriptions = subscriptions;
        if (filter === 'activeOnly') {
            filteredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'Active');
        } else if (filter === 'expiredOnly') {
            filteredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'Expired');
        }

        const subscriptionsWithTotalCost = filteredSubscriptions.map(sub => {
            return {
                _id: sub._id,
                name: sub.name,
                category: sub.category,
                price: sub.price,
                billingCycle: sub.billingCycle,
                totalSpent: parseFloat(getTotalAmountSpent(sub).toFixed(2))
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
            return {
                _id: sub._id,
                name: sub.name,
                price: sub.price,
                billingCycle: sub.billingCycle,
                monthlyCost: parseFloat(getNormalizedMonthlyCost(sub).toFixed(2)),
                totalSpent: parseFloat(getTotalAmountSpent(sub).toFixed(2)),
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
    getMonthlyTrend,
    getTopSubscriptions,
    getCategoryComparison
};
