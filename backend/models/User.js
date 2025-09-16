const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username je obavezan'],
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: [true, 'Email je obavezan'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email format nije valjan']
    },
    password: {
        type: String,
        required: [true, 'Password je obavezan'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Puzzle',
        default: []
    }],
    stats: {
        totalSolved: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
        totalPoints: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        lastActiveDate: { type: Date, default: null }
    },
    preferences: {
        favoriteCategories: [{ type: String }],
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        },
        notifications: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);