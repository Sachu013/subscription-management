const mongoose = require('mongoose');

const budgetSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            ref: 'User',
        },
        monthlyLimit: {
            type: Number,
            required: [true, 'Please set a monthly budget limit'],
            default: 0,
        },
        categoryLimits: [
            {
                category: {
                    type: String,
                    required: true,
                },
                limit: {
                    type: Number,
                    required: true,
                    default: 0,
                }
            }
        ]
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('UserBudget', budgetSchema);
