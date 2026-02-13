const Payment = require('../models/paymentModel');
const Subscription = require('../models/subscriptionModel');

// @desc    Get all payments for a subscription
// @route   GET /api/payments/:subscriptionId
// @access  Private
const getPaymentsBySubscription = async (req, res) => {
    try {
        const payments = await Payment.find({
            subscription: req.params.subscriptionId,
            user: req.user.id
        }).sort({ paymentDate: -1 });

        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a manual payment
// @route   POST /api/payments
// @access  Private
const addPayment = async (req, res) => {
    const { subscriptionId, amount, paymentDate, method, notes } = req.body;

    if (!subscriptionId || !amount || !paymentDate) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    try {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription || subscription.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Subscription not found or unauthorized' });
        }

        const payment = await Payment.create({
            subscription: subscriptionId,
            user: req.user.id,
            amount,
            paymentDate,
            method,
            notes
        });

        // Also update sub.payments for backward compatibility (optional but safer for now)
        subscription.payments.push({
            paidOn: paymentDate,
            amount: amount
        });
        await subscription.save();

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a payment
// @route   PUT /api/payments/:id
// @access  Private
const updatePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment || payment.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Payment not found or unauthorized' });
        }

        const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment || payment.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Payment not found or unauthorized' });
        }

        const subscription = await Subscription.findById(payment.subscription);
        if (subscription) {
            // Find and remove the matching payment from sub.payments array
            // We match by amount and date (approximate) or just filter out if they are similar
            subscription.payments = subscription.payments.filter(p => {
                const pDate = new Date(p.paidOn).getTime();
                const payDate = new Date(payment.paymentDate).getTime();
                return !(p.amount === payment.amount && Math.abs(pDate - payDate) < 10000);
            });
            await subscription.save();
        }

        await payment.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export payment history to CSV
// @route   GET /api/payments/:subscriptionId/export
// @access  Private
const exportPaymentsCSV = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.subscriptionId);
        if (!subscription || subscription.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const payments = await Payment.find({
            subscription: req.params.subscriptionId,
            user: req.user.id
        }).sort({ paymentDate: -1 });

        let csv = 'Date,Amount,Method,Notes\n';
        payments.forEach(p => {
            csv += `${new Date(p.paymentDate).toLocaleDateString()},${p.amount},${p.method || ''},"${p.notes || ''}"\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`${subscription.name}_payment_history.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPaymentsBySubscription,
    addPayment,
    updatePayment,
    deletePayment,
    exportPaymentsCSV
};
