const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');
const {
    getSubscriptionStatus,
    getTotalAmountSpent,
    getLastPaymentDate,
    getNextDueDate
} = require('../utils/subscriptionUtils');

// Helper to format subscription response
const formatSubscription = (sub) => {
    const subObj = sub.toObject ? sub.toObject() : sub;
    return {
        ...subObj,
        status: getSubscriptionStatus(subObj),
        totalSpent: getTotalAmountSpent(subObj),
        lastPayment: getLastPaymentDate(subObj),
        nextRenewalDate: getNextDueDate(subObj)
    };
};

// @desc    Get subscriptions
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user.id });
        const formatted = subscriptions.map(formatSubscription);
        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set subscription
// @route   POST /api/subscriptions
// @access  Private
const createSubscription = async (req, res) => {
    const {
        name,
        category,
        price,
        startDate,
        billingCycle,
    } = req.body;

    if (!name || !price || !startDate || !billingCycle) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    try {
        const subscription = await Subscription.create({
            user: req.user.id,
            name,
            category,
            price,
            startDate,
            billingCycle,
            payments: [],
        });

        res.status(201).json(formatSubscription(subscription));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get subscription by ID
// @route   GET /api/subscriptions/:id
// @access  Private
const getSubscriptionById = async (req, res) => {
    try {
        // Guard against legacy calls to deprecated endpoint names
        if (req.params.id === 'upcoming-payments') {
            return res.status(404).json({ message: 'Endpoint deprecated. Calculate upcoming payments on frontend.' });
        }

        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Make sure user owns the subscription
        if (subscription.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        res.status(200).json(formatSubscription(subscription));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the subscription user
        if (subscription.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );

        res.status(200).json(formatSubscription(updatedSubscription));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the subscription user
        if (subscription.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await subscription.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a payment to subscription
// @route   POST /api/subscriptions/:id/pay
// @access  Private
const paySubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        if (subscription.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Use manual date or today
        const paidOn = req.body.paidOn ? new Date(req.body.paidOn) : new Date();
        const amount = req.body.amount || subscription.price;

        subscription.payments.push({
            paidOn,
            amount
        });

        await subscription.save();
        res.status(200).json(formatSubscription(subscription));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSubscriptions,
    createSubscription,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    paySubscription,
};
