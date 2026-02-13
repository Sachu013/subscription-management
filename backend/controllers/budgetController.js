const UserBudget = require('../models/budgetModel');
const Subscription = require('../models/subscriptionModel');
const Payment = require('../models/paymentModel');
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

        // Calculate current month date range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Sum payments that fall within the current month across ALL user's payments
        const currentMonthPayments = await Payment.find({
            user: req.user.id,
            paymentDate: { $gte: startOfMonth, $lte: endOfMonth }
        }).populate('subscription');

        let monthlySpending = 0;
        const categorySpending = {};

        currentMonthPayments.forEach(payment => {
            const amount = payment.amount || 0;
            monthlySpending += amount;

            const category = (payment.subscription && payment.subscription.category) || 'Other';
            categorySpending[category] = (categorySpending[category] || 0) + amount;
        });

        res.status(200).json({
            budget,
            monthlySpending: parseFloat(monthlySpending.toFixed(2)),
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
