const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');
// @route   POST /api/users/favorites/:puzzleId
// @desc    Add puzzle to favorites
// @access  Private
router.post('/favorites/:puzzleId', auth, userController.addFavorite);

// @route   DELETE /api/users/favorites/:puzzleId
// @desc    Remove puzzle from favorites
// @access  Private
router.delete('/favorites/:puzzleId', auth, userController.removeFavorite);

// @route   GET /api/users/favorites
// @desc    Get all favorite puzzles
// @access  Private
router.get('/favorites', auth, userController.getFavorites);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, userController.updateProfile);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, userController.getUserStats);

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/leaderboard', userController.getLeaderboard);

// @route   GET /api/users
// @desc    Get all users (Admin)
// @access  Private (Admin)
router.get('/', adminAuth, userController.getAllUsers);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin)
// @access  Private (Admin)
router.delete('/:id', adminAuth, userController.deleteUser);

module.exports = router;