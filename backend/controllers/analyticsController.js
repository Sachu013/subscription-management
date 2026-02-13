const Subscription = require('../models/subscriptionModel');
const Payment = require('../models/paymentModel');
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

        const [monthlyPayments, allPayments] = await Promise.all([
            Payment.find({
                user: req.user.id,
                paymentDate: { $gte: new Date(currentYear, currentMonth, 1), $lte: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59) }
            }),
            Payment.find({ user: req.user.id })
        ]);

        const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const allTimeTotal = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        subscriptions.forEach(sub => {
            const subObj = sub.toObject();
            const status = getSubscriptionStatus(subObj);

            if (status === 'Active') activeCount++;
            else if (status === 'Expired') expiredCount++;
            else if (status === 'Upcoming') upcomingCount++;
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

        if (filter === 'current_month') {
            const currentPayments = await Payment.find({
                user: req.user.id,
                paymentDate: { $gte: new Date(currentYear, currentMonth, 1), $lte: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59) }
            }).populate('subscription');

            currentPayments.forEach(p => {
                const category = (p.subscription && p.subscription.category) || 'Other';
                categoryMap[category] = (categoryMap[category] || 0) + (p.amount || 0);
            });
        } else {
            // For allTime or activeOnly, we can still use subscriptions but we should calculate totalSpent from Payment collection
            const subIds = filteredSubscriptions.map(s => s._id);
            const allPayments = await Payment.find({ subscription: { $in: subIds } }).populate('subscription');

            allPayments.forEach(p => {
                const category = (p.subscription && p.subscription.category) || 'Other';
                categoryMap[category] = (categoryMap[category] || 0) + (p.amount || 0);
            });
        }

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

            const monthlyPayments = await Payment.find({
                user: req.user.id,
                paymentDate: { $gte: new Date(year, month, 1), $lte: new Date(year, month + 1, 0, 23, 59, 59) }
            });

            const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

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

        const subscriptionsWithTotalCost = await Promise.all(filteredSubscriptions.map(async (sub) => {
            const price = sub.price !== undefined ? sub.price : (sub.cost !== undefined ? sub.cost : 0);

            // Calculate actual total spent from Payment collection
            const payments = await Payment.find({ subscription: sub._id, user: req.user.id });
            const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

            return {
                _id: sub._id,
                name: sub.name,
                category: sub.category,
                price: price,
                billingCycle: sub.billingCycle,
                totalSpent: parseFloat(totalSpent.toFixed(2))
            };
        }));

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
