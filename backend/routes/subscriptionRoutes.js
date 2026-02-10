const express = require('express');
const router = express.Router();
const {
    getSubscriptions,
    createSubscription,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    getUpcomingPayments,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getSubscriptions).post(protect, createSubscription);
router
    .route('/:id')
    .get(protect, getSubscriptionById)
    .put(protect, updateSubscription)
    .delete(protect, deleteSubscription);

router.get('/upcoming-payments', protect, getUpcomingPayments);

module.exports = router;
