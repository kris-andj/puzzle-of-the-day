const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Puzzle = require('../models/Puzzle');



describe('E2E test - user flow', () => {
  let userToken, puzzleId;

  beforeAll(async () => {
    await User.deleteMany({ email: /e2euser/ });
    await Puzzle.deleteMany({ title: /E2E Test Puzzle/ });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /e2euser/ });
    await Puzzle.deleteMany({ title: /E2E Test Puzzle/ });
    await mongoose.connection.close();
  });

  it('registruje korisnika', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'e2euser', email: 'e2euser@gmail.com', password: 'test1234' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBeDefined();
  });

  it('prijavljuje korisnika', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'e2euser@gmail.com', password: 'test1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    userToken = res.body.token;
  });

  it('admin kreira slagalicu', async () => {
    
    let admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      admin = await User.create({ username: 'admin', email: 'admin@gmail.com', password: 'admin123', role: 'admin' });
    }
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: 'admin123' });
    const adminToken = loginRes.body.token;
    
    const res = await request(app)
      .post('/api/puzzles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'E2E Test Puzzle',
        description: 'Opis za e2e',
        category: 'logika',
        difficulty: 'easy',
        question: '3+3=?',
        correctAnswer: '6',
        options: ['5', '6', '7'],
        explanation: '3+3=6',
        points: 10,
        isActive: true
      });
    expect(res.statusCode).toBe(201);
    puzzleId = res.body.puzzle._id;
  });

  it('korisnik rešava slagalicu', async () => {
    const res = await request(app)
      .post(`/api/puzzles/${puzzleId}/solve`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userAnswer: '6' });
    expect(res.statusCode).toBe(200);
    expect(res.body.isCorrect).toBe(true);
    expect(res.body.pointsEarned).toBe(10);
  });

  it('korisnik vidi statistiku', async () => {
    const res = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.stats.totalSolved).toBeGreaterThanOrEqual(1);
    expect(res.body.stats.totalPoints).toBeGreaterThanOrEqual(10);
  });

  it('korisnik vidi leaderboard', async () => {
    const res = await request(app)
      .get('/api/users/leaderboard');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.leaderboard)).toBe(true);
    expect(res.body.leaderboard.some(u => u.username === 'e2euser')).toBe(true);
  });
});
