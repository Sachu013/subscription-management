const Subscription = require('../models/subscriptionModel');

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
// @access  Private
const getAnalyticsSummary = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user.id });
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active');

        let monthlyTotal = 0;
        let yearlyTotal = 0;

        activeSubscriptions.forEach(sub => {
            if (sub.billingCycle === 'Monthly') {
                monthlyTotal += sub.cost;
                yearlyTotal += sub.cost * 12;
            } else if (sub.billingCycle === 'Yearly') {
                yearlyTotal += sub.cost;
                monthlyTotal += sub.cost / 12;
            } else if (sub.billingCycle === 'Weekly') {
                monthlyTotal += sub.cost * 4;
                yearlyTotal += sub.cost * 52;
            }
        });

        res.status(200).json({
            activeCount: activeSubscriptions.length,
            totalCount: subscriptions.length,
            monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
            yearlyTotal: parseFloat(yearlyTotal.toFixed(2)),
            cancelledCount: subscriptions.filter(sub => sub.status === 'Cancelled').length,
            expiredCount: subscriptions.filter(sub => sub.status === 'Expired').length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get category-wise breakdown
// @route   GET /api/analytics/category-breakdown
// @access  Private
const getCategoryBreakdown = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({
            user: req.user.id,
            status: 'Active'
        });

        const categoryMap = {};

        subscriptions.forEach(sub => {
            const category = sub.category || 'Other';
            let monthlyCost = 0;

            if (sub.billingCycle === 'Monthly') {
                monthlyCost = sub.cost;
            } else if (sub.billingCycle === 'Yearly') {
                monthlyCost = sub.cost / 12;
            } else if (sub.billingCycle === 'Weekly') {
                monthlyCost = sub.cost * 4;
            }

            if (categoryMap[category]) {
                categoryMap[category].total += monthlyCost;
                categoryMap[category].count += 1;
            } else {
                categoryMap[category] = {
                    total: monthlyCost,
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

        // Generate last 12 months
        const monthlyData = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });

            // Calculate spending for this month
            let monthlySpending = 0;

            subscriptions.forEach(sub => {
                const startDate = new Date(sub.startDate);

                // Only include if subscription was active during this month
                if (startDate <= date && sub.status === 'Active') {
                    if (sub.billingCycle === 'Monthly') {
                        monthlySpending += sub.cost;
                    } else if (sub.billingCycle === 'Yearly') {
                        monthlySpending += sub.cost / 12;
                    } else if (sub.billingCycle === 'Weekly') {
                        monthlySpending += sub.cost * 4;
                    }
                }
            });

            monthlyData.push({
                month: monthName,
                amount: parseFloat(monthlySpending.toFixed(2))
            });
        }

        res.status(200).json(monthlyData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top subscriptions by cost
// @route   GET /api/analytics/top-subscriptions
// @access  Private
const getTopSubscriptions = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const subscriptions = await Subscription.find({
            user: req.user.id,
            status: 'Active'
        });

        const subscriptionsWithMonthlyCost = subscriptions.map(sub => {
            let monthlyCost = 0;

            if (sub.billingCycle === 'Monthly') {
                monthlyCost = sub.cost;
            } else if (sub.billingCycle === 'Yearly') {
                monthlyCost = sub.cost / 12;
            } else if (sub.billingCycle === 'Weekly') {
                monthlyCost = sub.cost * 4;
            }

            return {
                _id: sub._id,
                name: sub.name,
                category: sub.category,
                cost: sub.cost,
                billingCycle: sub.billingCycle,
                monthlyCost: parseFloat(monthlyCost.toFixed(2))
            };
        });

        const topSubscriptions = subscriptionsWithMonthlyCost
            .sort((a, b) => b.monthlyCost - a.monthlyCost)
            .slice(0, limit);

        res.status(200).json(topSubscriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAnalyticsSummary,
    getCategoryBreakdown,
    getMonthlyTrend,
    getTopSubscriptions
};
