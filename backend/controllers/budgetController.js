const UserBudget = require('../models/budgetModel');
const Subscription = require('../models/subscriptionModel');
const { getNormalizedMonthlyCost } = require('../utils/subscriptionUtils');

// @desc    Get user budget and spending
// @route   GET /api/budget
// @access  Private
const getBudget = async (req, res) => {
    try {
        let budget = await UserBudget.findOne({ user: req.user.id });
        if (!budget) {
            budget = await UserBudget.create({ user: req.user.id, monthlyLimit: 0, categoryLimits: [] });
        }

        // Calculate current month spending from actual payments
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Fetch all subscriptions for the user
        const subscriptions = await Subscription.find({ user: req.user.id });

        // Sum payments that fall within the current month across ALL user's subscriptions
        let monthlySpending = 0;
        const categorySpending = {};

        subscriptions.forEach(sub => {
            if (sub.payments && sub.payments.length > 0) {
                sub.payments.forEach(p => {
                    const pDate = new Date(p.paidOn);
                    if (pDate >= startOfMonth && pDate <= endOfMonth) {
                        monthlySpending += (p.amount || 0);

                        // Also update category breakdown based on current month's ACTUAL payments
                        const category = sub.category || 'Other';
                        categorySpending[category] = (categorySpending[category] || 0) + (p.amount || 0);
                    }
                });
            }
        });

        res.status(200).json({
            budget,
            monthlySpending,
            categorySpending
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user budget
// @route   PUT /api/budget
// @access  Private
const updateBudget = async (req, res) => {
    const { monthlyLimit, categoryLimits } = req.body;
    try {
        let budget = await UserBudget.findOneAndUpdate(
            { user: req.user.id },
            { monthlyLimit, categoryLimits },
            { new: true, upsert: true }
        );
        res.status(200).json(budget);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getBudget,
    updateBudget
};
