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
        enum: [
            'Entertainment',
            'Music',
            'OTT / Streaming',
            'Gaming',
            'Education',
            'Productivity',
            'Cloud Services',
            'Developer Tools',
            'Design Tools',
            'Finance',
            'Health & Fitness',
            'Food & Delivery',
            'News & Media',
            'Shopping',
            'Utilities',
            'Travel',
            'Storage',
            'Communication',
            'Security',
            'AI Tools',
            'Other'
        ],
        default: 'Other',
        required: true
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
    reminderEnabled: {
        type: Boolean,
        default: false
    },
    reminderDays: {
        type: Number,
        enum: [3, 7, 14],
        default: 7
    },
    status: {
        type: String,
        enum: ['Active', 'Cancelled', 'Expired'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
