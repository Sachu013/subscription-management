const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');
const { getSubscriptionStatus } = require('../utils/subscriptionUtils');

// @desc    Get subscriptions
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user.id });

        // Add computedStatus to each subscription
        const subscriptionsWithStatus = subscriptions.map(sub => {
            const subObj = sub.toObject();
            return {
                ...subObj,
                computedStatus: getSubscriptionStatus(sub)
            };
        });

        res.status(200).json(subscriptionsWithStatus);
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
        cost,
        currency,
        startDate,
        billingCycle,
        nextBillingDate,
        endDate,
        status,
    } = req.body;

    if (!name || !cost || !startDate || !billingCycle || !nextBillingDate) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    try {
        const subscription = await Subscription.create({
            user: req.user.id,
            name,
            category,
            cost,
            currency,
            startDate,
            billingCycle,
            nextBillingDate,
            endDate,
        });

        res.status(201).json(subscription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get subscription by ID
// @route   GET /api/subscriptions/:id
// @access  Private
const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Make sure user owns the subscription
        if (subscription.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        res.status(200).json(subscription);
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

        res.status(200).json(updatedSubscription);
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

// @desc    Get upcoming payments (within next 7 days)
// @route   GET /api/subscriptions/upcoming-payments
// @access  Private
const getUpcomingPayments = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user.id });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);

        const upcomingPayments = subscriptions
            .filter(sub => {
                // 1. Must be dynamic "Active"
                if (getSubscriptionStatus(sub) !== 'ACTIVE') return false;

                // 2. Check if nextBillingDate is within next 7 days
                if (!sub.nextBillingDate) return false;

                const nextBilling = new Date(sub.nextBillingDate);
                nextBilling.setHours(0, 0, 0, 0);
                return nextBilling >= today && nextBilling <= sevenDaysFromNow;
            })
            .map(sub => {
                const nextBilling = new Date(sub.nextBillingDate);
                nextBilling.setHours(0, 0, 0, 0);
                const daysUntilRenewal = Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24));

                return {
                    _id: sub._id,
                    name: sub.name,
                    category: sub.category,
                    cost: sub.cost,
                    currency: sub.currency,
                    billingCycle: sub.billingCycle,
                    nextBillingDate: sub.nextBillingDate,
                    daysUntilRenewal: daysUntilRenewal
                };
            })
            .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

        res.status(200).json(upcomingPayments);
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
    getUpcomingPayments,
};
