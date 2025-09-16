const jwt = require('jsonwebtoken');
const User = require('../models/User');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'Korisnik sa tim email-om ili username-om već postoji'
            });
        }

        
        const user = await User.create({
            username,
            email,
            password
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('LOGIN TRY:', { email, password });
        const user = await User.findOne({ email }).select('+password');
        console.log('USER FOUND:', user ? user.email : null);
        if (!user) {
            console.log('LOGIN FAIL: user not found');
            return res.status(400).json({ 
                message: 'Neispravni podaci za prijavu' 
            });
        }
        const isMatch = await user.comparePassword(password);
        console.log('PASSWORD MATCH:', isMatch);
        if (!isMatch) {
            console.log('LOGIN FAIL: password mismatch');
            return res.status(400).json({ 
                message: 'Neispravni podaci za prijavu' 
            });
        }
        const token = generateToken(user._id);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

module.exports = {
    register,
    login,
    getMe
};