const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
    {
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Subscription',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
        },
        paymentDate: {
            type: Date,
            required: [true, 'Please add a payment date'],
            default: Date.now,
        },
        method: {
            type: String,
            default: 'Online',
        },
        notes: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Payment', paymentSchema);
