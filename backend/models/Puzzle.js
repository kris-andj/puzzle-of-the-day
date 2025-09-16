const mongoose = require('mongoose');

const puzzleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Naslov slagalice je obavezan'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Opis slagalice je obavezan']
    },
    category: {
        type: String,
        required: [true, 'Kategorija je obavezna'],
        enum: ['logika', 'matematika', 'reči', 'znanje', 'kombinatorika']
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    question: {
        type: String,
        required: [true, 'Pitanje je obavezno']
    },
    correctAnswer: {
        type: String,
        required: [true, 'Tačan odgovor je obavezan']
    },
    options: [{
        type: String
    }], // Za multiple choice pitanja
    explanation: {
        type: String,
        required: [true, 'Objašnjenje je obavezno']
    },
    points: {
        type: Number,
        default: function() {
            switch(this.difficulty) {
                case 'easy': return 10;
                case 'medium': return 20;
                case 'hard': return 30;
                default: return 10;
            }
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    dateUsed: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Puzzle', puzzleSchema);