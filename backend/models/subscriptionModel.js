const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: [true, 'Please add a subscription name'],
        },
        category: {
            type: String,
            required: false,
        },
        cost: {
            type: Number,
            required: [true, 'Please add the cost'],
        },
        currency: {
            type: String,
            default: 'INR',
        },
        startDate: {
            type: Date,
            required: [true, 'Please add a start date'],
        },
        billingCycle: {
            type: String, // e.g., 'Monthly', 'Yearly'
            required: [true, 'Please add a billing cycle'],
        },
        nextBillingDate: {
            type: Date,
            required: [true, 'Please add the next billing date'],
        },
        endDate: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
