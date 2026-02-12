const express = require('express');
const router = express.Router();
const {
    getAnalyticsSummary,
    getCategoryBreakdown,
    getMonthlyExpenses,
    getTopSubscriptions,
    getCategoryComparison
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getAnalyticsSummary);
router.get('/category-breakdown', protect, getCategoryBreakdown);
router.get('/monthly-expenses', protect, getMonthlyExpenses);
router.get('/top-subscriptions', protect, getTopSubscriptions);
router.get('/category-comparison/:category', protect, getCategoryComparison);

module.exports = router;
