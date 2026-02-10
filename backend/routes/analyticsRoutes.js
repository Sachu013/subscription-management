const express = require('express');
const router = express.Router();
const {
    getAnalyticsSummary,
    getCategoryBreakdown,
    getMonthlyTrend,
    getTopSubscriptions,
    getCategoryComparison
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getAnalyticsSummary);
router.get('/category-breakdown', protect, getCategoryBreakdown);
router.get('/monthly-trend', protect, getMonthlyTrend);
router.get('/top-subscriptions', protect, getTopSubscriptions);
router.get('/category-comparison/:category', protect, getCategoryComparison);

module.exports = router;
