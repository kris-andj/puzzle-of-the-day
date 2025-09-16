
const express = require('express');
const router = express.Router();
const puzzleController = require('../controllers/puzzleController');
const { auth, adminAuth } = require('../middleware/auth');

// @route   POST /api/puzzles/batch
// @desc    Batch upload puzzles
// @access  Private (Admin)
router.post('/batch', adminAuth, puzzleController.batchUploadPuzzles);

// @route   GET /api/puzzles/daily
// @desc    Get daily puzzle
// @access  Public
router.get('/daily', puzzleController.getDailyPuzzle);

// @route   GET /api/puzzles
// @desc    Get all puzzles (paginated)
// @access  Public  
router.get('/', puzzleController.getAllPuzzles);

// @route   GET /api/puzzles/:id
// @desc    Get puzzle by ID
// @access  Public
router.get('/:id', puzzleController.getPuzzleById);

// @route   POST /api/puzzles
// @desc    Create new puzzle
// @access  Private (Admin)
router.post('/', adminAuth, puzzleController.createPuzzle);


// @route   PUT /api/puzzles/:id
// @desc    Update puzzle
// @access  Private (Admin)
router.put('/:id', adminAuth, puzzleController.updatePuzzle);

// @route   DELETE /api/puzzles/:id
// @desc    Delete puzzle
// @access  Private (Admin)
router.delete('/:id', adminAuth, puzzleController.deletePuzzle);

// @route   POST /api/puzzles/:id/solve
// @desc    Submit answer to puzzle
// @access  Private
router.post('/:id/solve', auth, puzzleController.solvePuzzle);

// @route   GET /api/puzzles/next-daily
// @desc    Get next daily puzzle (admin)
// @access  Private (Admin)
router.get('/next-daily', adminAuth, puzzleController.getNextDailyPuzzle);

module.exports = router;