const Subscription = require('../models/subscriptionModel');

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate subscription status based on dates
 * @param {Object} subscription - Subscription object
 * @returns {string} - 'active', 'expired', or 'upcoming'
 */
const getSubscriptionStatus = (subscription) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const startDate = new Date(subscription.startDate);
    startDate.setHours(0, 0, 0, 0);

    // Check if upcoming (not yet started)
    if (now < startDate) {
        return 'upcoming';
    }

    // Check if expired
    if (subscription.endDate) {
        const endDate = new Date(subscription.endDate);
        endDate.setHours(0, 0, 0, 0);

        if (now > endDate) {
            return 'expired';
        }
    }

    // Otherwise active
    return 'active';
};

/**
 * Check if subscription is active in a specific month
 * @param {Object} subscription - Subscription object
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {boolean} - True if active in the month
 */
const isActiveInMonth = (subscription, month, year) => {
    const monthStart = new Date(year, month, 1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(year, month + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const startDate = new Date(subscription.startDate);
    if (isNaN(startDate.getTime())) return false; // Invalid start date
    startDate.setHours(0, 0, 0, 0);

    let endDate = null;
    if (subscription.endDate) {
        endDate = new Date(subscription.endDate);
        if (isNaN(endDate.getTime())) {
            endDate = null; // Treat invalid end date as ongoing
        } else {
            endDate.setHours(23, 59, 59, 999);
        }
    }

    // Subscription must start before or during the month
    if (startDate > monthEnd) return false;

    // Subscription must not have ended before the month
    if (endDate && endDate < monthStart) return false;

    return true;
};

/**
 * Calculate monthly expense for a subscription
 * @param {Object} subscription - Subscription object
 * @returns {number} - Monthly cost
 */
const getMonthlyExpense = (subscription) => {
    let monthlyCost = 0;

    if (subscription.billingCycle === 'Monthly') {
        monthlyCost = subscription.cost;
    } else if (subscription.billingCycle === 'Yearly') {
        monthlyCost = subscription.cost / 12;
    } else if (subscription.billingCycle === 'Weekly') {
        monthlyCost = subscription.cost * 4;
    }

    return monthlyCost;
};

// ==================== ANALYTICS ENDPOINTS ====================

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
// @access  Private
const getAnalyticsSummary = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user.id });

        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Calculate counts based on computed status
        let activeCount = 0;
        let expiredCount = 0;
        let upcomingCount = 0;
        let monthlyTotal = 0;
        let yearlyTotal = 0;

        subscriptions.forEach(sub => {
            const computedStatus = getSubscriptionStatus(sub);

            // 1. Logic for counts
            if (computedStatus === 'active') {
                activeCount++;
            } else if (computedStatus === 'expired') {
                expiredCount++;
            } else if (computedStatus === 'upcoming') {
                upcomingCount++;
            }

            // 2. Additional logic for "Upcoming / Expiring Soon" (due within 7 days)
            // Even if it's currently 'active', it is ALSO 'upcoming' in terms of billing
            if (computedStatus === 'active' && sub.nextBillingDate) {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const nextBilling = new Date(sub.nextBillingDate);
                nextBilling.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((nextBilling - now) / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && diffDays <= 7) {
                    // Only increment if not already counted as upcoming (which it shouldn't be anyway)
                    upcomingCount++;
                }
            }

            // 3. Logic for spending (Must be active in current month)
            if (isActiveInMonth(sub, currentMonth, currentYear)) {
                const monthlyExpense = getMonthlyExpense(sub);
                monthlyTotal += monthlyExpense;
                yearlyTotal += monthlyExpense * 12;
            }
        });

        res.status(200).json({
            activeCount,
            expiredCount,
            upcomingCount,
            totalCount: subscriptions.length,
            monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
            yearlyTotal: parseFloat(yearlyTotal.toFixed(2)),
            cancelledCount: subscriptions.filter(sub => sub.status === 'Cancelled').length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get category-wise breakdown
// @route   GET /api/analytics/category-breakdown?filter=current|all_time|expired
// @access  Private
const getCategoryBreakdown = async (req, res) => {
    try {
        const filter = req.query.filter || 'current'; // Default to 'current'
        const subscriptions = await Subscription.find({ user: req.user.id });

        // Filter subscriptions based on computed status
        let filteredSubscriptions = subscriptions;
        if (filter === 'current') {
            filteredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'active');
        } else if (filter === 'expired') {
            filteredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'expired');
        }
        // 'all_time' includes all subscriptions (no filtering)

        const categoryMap = {};

        filteredSubscriptions.forEach(sub => {
            const category = sub.category || 'Other';
            const monthlyCost = getMonthlyExpense(sub);

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
            const month = date.getMonth();
            const year = date.getFullYear();
            const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });

            // Calculate spending for this month
            let monthlySpending = 0;

            subscriptions.forEach(sub => {
                // Only include if subscription was active during this month
                if (isActiveInMonth(sub, month, year)) {
                    monthlySpending += getMonthlyExpense(sub);
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
// @route   GET /api/analytics/top-subscriptions?limit=5&filter=current|all_time
// @access  Private
const getTopSubscriptions = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const filter = req.query.filter || 'current'; // Default to 'current'
        const subscriptions = await Subscription.find({ user: req.user.id });

        // Filter subscriptions based on computed status
        let filteredSubscriptions = subscriptions;
        if (filter === 'current') {
            filteredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'active');
        }
        // 'all_time' includes all subscriptions (no filtering)

        const subscriptionsWithMonthlyCost = filteredSubscriptions.map(sub => {
            const monthlyCost = getMonthlyExpense(sub);

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

// @desc    Get category comparison
// @route   GET /api/analytics/category-comparison/:category
// @access  Private
const getCategoryComparison = async (req, res) => {
    try {
        const category = req.params.category;
        const subscriptions = await Subscription.find({
            user: req.user.id,
            category: category,
            status: 'Active'
        });

        const comparisonData = subscriptions.map(sub => {
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
                cost: sub.cost,
                billingCycle: sub.billingCycle,
                monthlyCost: parseFloat(monthlyCost.toFixed(2)),
                startDate: sub.startDate
            };
        }).sort((a, b) => b.monthlyCost - a.monthlyCost);

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
