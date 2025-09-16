
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();


const authRoutes = require('./routes/auth');
const puzzleRoutes = require('./routes/puzzles');
const userRoutes = require('./routes/users');

const app = express();


app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});


mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ MongoDB povezan uspešno');
    console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch(err => {
    console.error('❌ Greška pri povezivanju sa MongoDB:', err);
    process.exit(1);
});


app.use('/api/auth', authRoutes);
app.use('/api/puzzles', puzzleRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
    res.json({ 
        message: 'Slagalica dana API radi!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});


 app.get('/health', (req, res) => {
     res.json({ status: 'ok' });
 });

 
 app.get('/api/health', (req, res) => {
     res.json({ status: 'ok' });
 });


app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        message: 'Nešto je pošlo po zlu!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
});


app.use((req, res) => {
    res.status(404).json({
        message: `Ruta ${req.originalUrl} nije pronađena`
    });
});

const PORT = process.env.PORT || 5000;


const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Server pokrenut na portu ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API dostupan na: http://localhost:${PORT}`);
});



const { Server } = require('socket.io');
const io = new Server(httpServer, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('🟢 Novi korisnik povezan na WebSocket:', socket.id);
    socket.on('disconnect', () => {
        console.log('🔴 Korisnik se diskonektovao:', socket.id);
    });
});


app.emitNewPuzzleNotification = (puzzle) => {
    io.emit('new-daily-puzzle', {
        message: 'Nova "Slagalica dana" je dostupna!',
        puzzle: puzzle ? { id: puzzle._id, title: puzzle.title, category: puzzle.category } : undefined
    });
};


process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

module.exports = app;