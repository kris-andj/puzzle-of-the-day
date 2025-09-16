const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Nema tokena, pristup odbačen' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'Token nije valjan' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token nije valjan' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {});
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin privilegije potrebne' });
        }
        
        next();
    } catch (error) {
        res.status(403).json({ message: 'Admin privilegije potrebne' });
    }
};

module.exports = { auth, adminAuth };