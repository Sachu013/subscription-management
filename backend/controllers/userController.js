const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userModel');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ username, email, password });
        const token = generateToken(user._id);
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id);
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: 'Missing credential' });
        }
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        const googleId = payload.sub;
        const username = payload.name || email.split('@')[0];
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ username, email, googleId });
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }
        const token = generateToken(user._id);
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If the email exists, a reset link was sent' });
        }
        res.status(200).json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    googleLogin,
    forgotPassword,
};
