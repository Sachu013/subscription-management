const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subscription = require('../models/subscriptionModel');
const Payment = require('../models/paymentModel');

dotenv.config({ path: '../../.env' }); // Adjusted path for typical script location

const migratePayments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for migration...');

        const subscriptions = await Subscription.find({});
        let migratedCount = 0;

        for (const sub of subscriptions) {
            if (sub.payments && sub.payments.length > 0) {
                for (const p of sub.payments) {
                    // Check if already migrated
                    const existing = await Payment.findOne({
                        subscription: sub._id,
                        paymentDate: p.paidOn,
                        amount: p.amount
                    });

                    if (!existing) {
                        await Payment.create({
                            subscription: sub._id,
                            user: sub.user,
                            amount: p.amount,
                            paymentDate: p.paidOn,
                            method: 'Legacy',
                            notes: 'Migrated from embedded history'
                        });
                        migratedCount++;
                    }
                }
            }
        }

        console.log(`Migration completed! Migrated ${migratedCount} payments.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migratePayments();
