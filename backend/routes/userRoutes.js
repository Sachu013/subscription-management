const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    googleLogin
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
module.exports = router;
