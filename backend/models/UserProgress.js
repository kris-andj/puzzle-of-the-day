const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    puzzle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Puzzle',
        required: true
    },
    userAnswer: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    timeSpent: {
        type: Number, 
        default: 0
    },
    solvedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});


userProgressSchema.index({ user: 1, puzzle: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);