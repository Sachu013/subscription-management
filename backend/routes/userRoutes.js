const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    googleLogin,
    forgotPassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);
module.exports = router;
