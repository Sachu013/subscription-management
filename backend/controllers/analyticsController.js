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

    // 1. Upcoming: startDate > today
    if (startDate > now) {
        return 'upcoming';
    }

    // 2. Expired: endDate exists AND endDate < today
    if (subscription.endDate) {
        const endDate = new Date(subscription.endDate);
        endDate.setHours(0, 0, 0, 0);

        if (endDate < now) {
            return 'expired';
        }
    }

    // 3. Active: startDate <= today AND (endDate is NULL OR endDate >= today)
    // (Already covered by exclusion, but explicit for clarity)
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
    if (isNaN(startDate.getTime())) return false;
    startDate.setHours(0, 0, 0, 0);

    let endDate = null;
    if (subscription.endDate) {
        endDate = new Date(subscription.endDate);
        if (isNaN(endDate.getTime())) {
            endDate = null;
        } else {
            endDate.setHours(23, 59, 59, 999);
        }
    }

    // A subscription is active in that month IF:
    // startDate <= monthEnd AND (endDate is NULL OR endDate >= monthStart)
    return startDate <= monthEnd && (endDate === null || endDate >= monthStart);
};

/**
 * Get normalized monthly cost
 * @param {Object} subscription - Subscription object
 * @returns {number} - Normalized monthly cost
 */
const getNormalizedMonthlyCost = (subscription) => {
    const cost = subscription.cost || 0;
    if (subscription.billingCycle === 'Monthly') {
        return cost;
    } else if (subscription.billingCycle === 'Yearly') {
        return cost / 12;
    } else if (subscription.billingCycle === 'Weekly') {
        return cost * 4;
    }
    return cost;
};

// ==================== ANALYTICS ENDPOINTS ====================

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
// @access  Private
const getAnalyticsSummary = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user.id });
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let activeCount = 0;
        let expiredCount = 0;
        let upcomingCount = 0;
        let monthlyTotal = 0;
        let upcomingDueSoonCount = 0;

        subscriptions.forEach(sub => {
            const computedStatus = getSubscriptionStatus(sub);

            // 1. Mandatory Counts
            if (computedStatus === 'active') {
                activeCount++;
            } else if (computedStatus === 'expired') {
                expiredCount++;
            } else if (computedStatus === 'upcoming') {
                upcomingCount++;
            }

            // 2. Upcoming Due Soon (Optional: nextBillingDate within next 7 days)
            if (sub.nextBillingDate) {
                const nextBilling = new Date(sub.nextBillingDate);
                nextBilling.setHours(0, 0, 0, 0);
                const diffTime = nextBilling - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && diffDays <= 7) {
                    upcomingDueSoonCount++;
                }
            }

            // 3. Monthly Spending (Current Month Only)
            if (isActiveInMonth(sub, currentMonth, currentYear)) {
                monthlyTotal += getNormalizedMonthlyCost(sub);
            }
        });

        res.status(200).json({
            activeCount,
            expiredCount,
            upcomingCount,
            upcomingDueSoonCount,
            totalCount: subscriptions.length,
            monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
            yearlyTotal: parseFloat((monthlyTotal * 12).toFixed(2)) // Normalized extension
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
        const filter = req.query.filter || 'current';
        const subscriptions = await Subscription.find({ user: req.user.id });

        let filteredSubscriptions = subscriptions;
        if (filter === 'current') {
            filteredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'active');
        } else if (filter === 'expired') {
            filteredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'expired');
        }

        const categoryMap = {};

        filteredSubscriptions.forEach(sub => {
            const category = sub.category || 'Other';
            const normalizedCost = getNormalizedMonthlyCost(sub);

            if (categoryMap[category]) {
                categoryMap[category].total += normalizedCost;
                categoryMap[category].count += 1;
            } else {
                categoryMap[category] = {
                    total: normalizedCost,
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

            // Calculate spending for this month independently
            let monthlyTotal = 0;

            subscriptions.forEach(sub => {
                if (isActiveInMonth(sub, month, year)) {
                    monthlyTotal += getNormalizedMonthlyCost(sub);
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
// @route   GET /api/analytics/top-subscriptions?limit=5&filter=current|all_time
// @access  Private
const getTopSubscriptions = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const filter = req.query.filter || 'current';
        const subscriptions = await Subscription.find({ user: req.user.id });

        let filteredSubscriptions = subscriptions;
        if (filter === 'current') {
            filteredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'active');
        }

        const subscriptionsWithMonthlyCost = filteredSubscriptions.map(sub => {
            return {
                _id: sub._id,
                name: sub.name,
                category: sub.category,
                cost: sub.cost,
                billingCycle: sub.billingCycle,
                monthlyCost: parseFloat(getNormalizedMonthlyCost(sub).toFixed(2))
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
            category: category
        });

        // Use dynamic active status
        const activeSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === 'active');

        const comparisonData = activeSubscriptions.map(sub => {
            return {
                _id: sub._id,
                name: sub.name,
                cost: sub.cost,
                billingCycle: sub.billingCycle,
                monthlyCost: parseFloat(getNormalizedMonthlyCost(sub).toFixed(2)),
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
