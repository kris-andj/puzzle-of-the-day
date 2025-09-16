const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Puzzle = require('../models/Puzzle');
// @desc    Add puzzle to favorites
// @route   POST /api/users/favorites/:puzzleId
// @access  Private
const addFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const puzzleId = req.params.puzzleId;
        if (!user.favorites.includes(puzzleId)) {
            user.favorites.push(puzzleId);
            await user.save();
        }
        res.json({ success: true, favorites: user.favorites });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove puzzle from favorites
// @route   DELETE /api/users/favorites/:puzzleId
// @access  Private
const removeFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const puzzleId = req.params.puzzleId;
        user.favorites = user.favorites.filter(fav => fav.toString() !== puzzleId);
        await user.save();
        res.json({ success: true, favorites: user.favorites });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all favorite puzzles
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites');
        res.json({ success: true, favorites: user.favorites });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { username, preferences } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username, preferences },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('stats');
        
        
        const recentActivity = await UserProgress.find({ user: req.user.id })
            .populate('puzzle', 'title category difficulty')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            stats: user.stats,
            recentActivity
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {

        const users = await User.find({ role: { $ne: 'admin' } })
            .select('username stats.totalPoints stats.correctAnswers stats.totalSolved')
            .sort({ 'stats.totalPoints': -1 })
            .limit(20);

        res.json({
            success: true,
            leaderboard: users
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    try {
        console.log('ADMIN PANEL /api/users:', {
            user: req.user,
            headers: req.headers
        });
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.json({
            success: true,
            users,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Korisnik nije pronađen' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Ne možete obrisati admin korisnika' });
        }
        await user.deleteOne();
        res.json({ success: true, message: 'Korisnik obrisan' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getUserStats,
    getLeaderboard,
    getAllUsers,
    addFavorite,
    removeFavorite,
    getFavorites,
    deleteUser
};