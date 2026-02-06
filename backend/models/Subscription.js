const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        default: 'Other'
    },
    cost: {
        type: Number,
        required: true
    },
    billingCycle: {
        type: String,
        enum: ['Monthly', 'Yearly', 'Weekly'],
        default: 'Monthly'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    renewalDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Active', 'Cancelled', 'Expired'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
