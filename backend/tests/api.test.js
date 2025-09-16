const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Puzzle = require('../models/Puzzle');

describe('Slagalica API - osnovni testovi', () => {

  let puzzleId;

  beforeAll(async () => {
    await User.deleteMany({ email: 'testuser1@gmail.com' });
    await Puzzle.deleteMany({ title: 'API Test Puzzle' });
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'testuser1@gmail.com' });
    await Puzzle.deleteMany({ title: 'API Test Puzzle' });
    await mongoose.connection.close();
  });

  it('može da dobije dnevnu slagalicu', async () => {
    
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser1', email: 'testuser1@gmail.com', password: 'test1234' });
    await Puzzle.create({
      title: 'API Test Puzzle',
      description: 'Test opis',
      category: 'logika',
      difficulty: 'easy',
      question: '2+2=?',
      correctAnswer: '4',
      options: ['3', '4', '5'],
      explanation: '2+2=4',
      points: 10,
      isActive: true,
      dateUsed: null
    });
    const res = await request(app).get('/api/puzzles/daily');
    expect(res.statusCode).toBe(200);
    expect(res.body.puzzle).toBeDefined();
  });

  it('može da reši slagalicu', async () => {
    
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser1', email: 'testuser1@gmail.com', password: 'test1234' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser1@gmail.com', password: 'test1234' });
    const token = loginRes.body.token;
    
    const puzzle = await Puzzle.create({
      title: 'API Test Puzzle',
      description: 'Test opis',
      category: 'logika',
      difficulty: 'easy',
      question: '2+2=?',
      correctAnswer: '4',
      options: ['3', '4', '5'],
      explanation: '2+2=4',
      points: 10,
      isActive: true,
      dateUsed: null
    });
    const res = await request(app)
      .post(`/api/puzzles/${puzzle._id}/solve`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userAnswer: '4' });
    expect(res.statusCode).toBe(200);
    expect(res.body.isCorrect).toBe(true);
    expect(res.body.pointsEarned).toBe(10);
  });
});
