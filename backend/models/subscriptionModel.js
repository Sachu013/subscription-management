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
            default: 'Other'
        },
        price: {
            type: Number,
            required: false, // Made optional to support legacy 'cost' field
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
            type: String,
            enum: ['Monthly', 'Yearly', 'monthly', 'yearly'],
            default: 'Monthly',
            required: [true, 'Please add a billing cycle'],
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

// Pre-save hook to normalize billingCycle
subscriptionSchema.pre('save', function (next) {
    if (this.billingCycle === 'monthly') this.billingCycle = 'Monthly';
    if (this.billingCycle === 'yearly') this.billingCycle = 'Yearly';
    next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
