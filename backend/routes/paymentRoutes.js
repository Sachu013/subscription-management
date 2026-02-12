const express = require('express');
const router = express.Router();
const {
    getPaymentsBySubscription,
    addPayment,
    updatePayment,
    deletePayment,
    exportPaymentsCSV
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addPayment);

router.route('/:id')
    .put(protect, updatePayment)
    .delete(protect, deletePayment);

router.get('/subscription/:subscriptionId', protect, getPaymentsBySubscription);
router.get('/subscription/:subscriptionId/export', protect, exportPaymentsCSV);

module.exports = router;
