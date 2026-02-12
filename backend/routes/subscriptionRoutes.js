const express = require('express');
const router = express.Router();
const {
    getSubscriptions,
    createSubscription,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    paySubscription,
    getCalendarData,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');


router.route('/').get(protect, getSubscriptions).post(protect, createSubscription);
router.get('/calendar', protect, getCalendarData);
router.route('/:id').get(protect, getSubscriptionById).put(protect, updateSubscription).delete(protect, deleteSubscription);
router.post('/:id/pay', protect, paySubscription);

module.exports = router;
