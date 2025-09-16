// @desc    Batch upload puzzles
// @route   POST /api/puzzles/batch
// @access  Private (Admin)
const batchUploadPuzzles = async (req, res) => {
    try {
        const { puzzles } = req.body;
        if (!Array.isArray(puzzles) || puzzles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Niste poslali nijednu slagalicu za upload.'
            });
        }
        
        const puzzlesWithAdmin = puzzles.map(p => ({ ...p, createdBy: req.user.id }));
        const created = await Puzzle.insertMany(puzzlesWithAdmin);
        res.status(201).json({
            success: true,
            count: created.length,
            puzzles: created
        });
    } catch (error) {
        console.error('Batch upload puzzles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
const Puzzle = require('../models/Puzzle');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');

// @desc    Get daily puzzle
// @route   GET /api/puzzles/daily
// @access  Public
const getDailyPuzzle = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log('DAILY PUZZLE: today =', today);
        
        let dailyPuzzle = await Puzzle.findOne({
            dateUsed: today,
            isActive: true
        }).select('-correctAnswer');
        console.log('DAILY PUZZLE: found for today =', dailyPuzzle);
        
        if (!dailyPuzzle) {
            dailyPuzzle = await Puzzle.findOne({
                isActive: true,
                dateUsed: null
            }).select('-correctAnswer');
            console.log('DAILY PUZZLE: found unused =', dailyPuzzle);
            
        }
        if (!dailyPuzzle) {
            console.log('DAILY PUZZLE: nema dostupnih slagalica');
            return res.status(404).json({
                message: 'Nema dostupnih slagalica za danas'
            });
        }
        
        if (req.app.emitNewPuzzleNotification) {
            req.app.emitNewPuzzleNotification(dailyPuzzle);
        }
        res.json({
            success: true,
            puzzle: dailyPuzzle
        });
    } catch (error) {
        console.error('Get daily puzzle error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all puzzles with pagination
// @route   GET /api/puzzles
// @access  Public
const getAllPuzzles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const difficulty = req.query.difficulty;
        
        const skip = (page - 1) * limit;
        
        let query = { isActive: true };
        
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;

        const puzzles = await Puzzle.find(query)
            .select('-correctAnswer')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Puzzle.countDocuments(query);

        res.json({
            success: true,
            puzzles,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get all puzzles error:', error);
        res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

// @desc    Get puzzle by ID
// @route   GET /api/puzzles/:id
// @access  Public
const getPuzzleById = async (req, res) => {
    try {
        const puzzle = await Puzzle.findById(req.params.id)
            .select('-correctAnswer');

        if (!puzzle) {
            return res.status(404).json({
                message: 'Slagalica nije pronađena'
            });
        }

        res.json({
            success: true,
            puzzle
        });

    } catch (error) {
        console.error('Get puzzle by ID error:', error);
        res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

// @desc    Create new puzzle
// @route   POST /api/puzzles
// @access  Private (Admin)
const createPuzzle = async (req, res) => {
    try {
        const puzzleData = {
            ...req.body,
            createdBy: req.user.id
        };

        const puzzle = await Puzzle.create(puzzleData);

        res.status(201).json({
            success: true,
            puzzle
        });

    } catch (error) {
        console.error('Create puzzle error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Update puzzle
// @route   PUT /api/puzzles/:id
// @access  Private (Admin)
const updatePuzzle = async (req, res) => {
    try {
        const puzzle = await Puzzle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!puzzle) {
            return res.status(404).json({
                message: 'Slagalica nije pronađena'
            });
        }

        res.json({
            success: true,
            puzzle
        });

    } catch (error) {
        console.error('Update puzzle error:', error);
        res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

// @desc    Delete puzzle
// @route   DELETE /api/puzzles/:id
// @access  Private (Admin)
const deletePuzzle = async (req, res) => {
    try {
        const puzzle = await Puzzle.findById(req.params.id);

        if (!puzzle) {
            return res.status(404).json({
                message: 'Slagalica nije pronađena'
            });
        }

        await puzzle.deleteOne();

        res.json({
            success: true,
            message: 'Slagalica obrisana'
        });

    } catch (error) {
        console.error('Delete puzzle error:', error);
        res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

// @desc    Solve puzzle
// @route   POST /api/puzzles/:id/solve
// @access  Private
const solvePuzzle = async (req, res) => {
    try {
        const { userAnswer, timeSpent = 0 } = req.body;
        const puzzleId = req.params.id;
        const userId = req.user.id;

        
        const puzzle = await Puzzle.findById(puzzleId);
        if (!puzzle) {
            return res.status(404).json({
                message: 'Slagalica nije pronađena'
            });
        }

        
        const existingProgress = await UserProgress.findOne({
            user: userId,
            puzzle: puzzleId
        });

        if (existingProgress) {
            return res.status(400).json({
                message: 'Već ste rešili ovu slagalicu'
            });
        }

        
        const isCorrect = userAnswer.trim().toLowerCase() === puzzle.correctAnswer.trim().toLowerCase();
        const pointsEarned = isCorrect ? puzzle.points : 0;
        const progress = await UserProgress.create({
            user: userId,
            puzzle: puzzleId,
            userAnswer,
            isCorrect,
            pointsEarned,
            timeSpent
        });

        // Ažuriraj korisničke statistike
        const user = await User.findById(userId);
        user.stats.totalSolved += 1;
        if (isCorrect) {
            user.stats.correctAnswers += 1;
            user.stats.totalPoints += pointsEarned;
        }
        user.stats.lastActiveDate = new Date();
        await user.save();

        res.json({
            success: true,
            isCorrect,
            correctAnswer: puzzle.correctAnswer,
            explanation: puzzle.explanation,
            pointsEarned,
            progress
        });

    } catch (error) {
        console.error('Solve puzzle error:', error);
        res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

// @desc    Get next daily puzzle (admin)
// @route   GET /api/puzzles/next-daily
// @access  Private (Admin)
const getNextDailyPuzzle = async (req, res) => {
    try {
        const nextPuzzle = await Puzzle.findOne({
            isActive: true,
            dateUsed: null
        }).sort({ createdAt: 1 });

        if (!nextPuzzle) {
            return res.status(404).json({
                message: 'Nema više neiskorišćenih slagalica za dnevnu rotaciju.'
            });
        }

        res.json({
            success: true,
            puzzle: nextPuzzle
        });
    } catch (error) {
        console.error('Get next daily puzzle error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDailyPuzzle,
    getAllPuzzles,
    getPuzzleById,
    createPuzzle,
    updatePuzzle,
    deletePuzzle,
    solvePuzzle,
    getNextDailyPuzzle,
    batchUploadPuzzles
};