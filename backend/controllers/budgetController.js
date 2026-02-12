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

        // Calculate current month spending
        const subscriptions = await Subscription.find({
            user: req.user.id,
            status: 'Active' // Exclude Paused and Expired
        });

        const monthlySpending = subscriptions.reduce((sum, sub) => sum + getNormalizedMonthlyCost(sub), 0);

        // Category breakdown
        const categorySpending = {};
        subscriptions.forEach(sub => {
            const cost = getNormalizedMonthlyCost(sub);
            categorySpending[sub.category] = (categorySpending[sub.category] || 0) + cost;
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
