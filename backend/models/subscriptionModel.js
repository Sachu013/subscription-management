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
        price: {
            type: Number,
            required: [true, 'Please add the price'],
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
            type: String, // 'monthly', 'yearly'
            required: [true, 'Please add a billing cycle'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        payments: [
            {
                paidOn: {
                    type: Date,
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                },
            }
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
