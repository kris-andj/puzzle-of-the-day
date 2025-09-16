const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Puzzle = require('../models/Puzzle');


async function getAdminToken() {
  let admin = await User.findOne({ email: 'admin@gmail.com' });
  if (!admin) {
    admin = await User.create({ username: 'admin', email: 'admin@gmail.com', password: 'admin123', role: 'admin' });
  }
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@gmail.com', password: 'admin123' });
  return res.body.token;
}

describe('Slagalica API - korisnici i slagalice', () => {
  it('Unit test za dodavanje i uklanjanje omiljene slagalice (favorites)', async () => {
    
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser_fav', email: 'testuser_fav@gmail.com', password: 'test1234' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser_fav@gmail.com', password: 'test1234' });
    const tokenFav = loginRes.body.token;
    
    const puzzleRes = await request(app)
      .post('/api/puzzles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Unit Test Puzzle',
        description: 'Opis za test',
        category: 'logika',
        difficulty: 'easy',
        question: '1+1=?',
        correctAnswer: '2',
        options: ['1', '2', '3'],
        explanation: '1+1=2',
        points: 5,
        isActive: true
      });
    const puzzleIdFav = puzzleRes.body.puzzle._id;
    
    const addRes = await request(app)
      .post(`/api/users/favorites/${puzzleIdFav}`)
      .set('Authorization', `Bearer ${tokenFav}`);
    expect(addRes.statusCode).toBe(200);
    expect(addRes.body.favorites).toContain(puzzleIdFav);
    
    const getRes = await request(app)
      .get('/api/users/favorites')
      .set('Authorization', `Bearer ${tokenFav}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.favorites.some(fav => fav._id === puzzleIdFav)).toBe(true);
    
    const delRes = await request(app)
      .delete(`/api/users/favorites/${puzzleIdFav}`)
      .set('Authorization', `Bearer ${tokenFav}`);
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.favorites).not.toContain(puzzleIdFav);
  });

  let userToken, adminToken, puzzleId;

  beforeAll(async () => {
    await User.deleteMany({ email: /testuser/ });
    await Puzzle.deleteMany({ title: /Unit Test Puzzle/ });
    
    adminToken = await getAdminToken();
  });

  beforeEach(async () => {
    
    await User.deleteMany({ email: /testuser/ });
    await Puzzle.deleteMany({ title: /Unit Test Puzzle/ });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /testuser/ });
    await Puzzle.deleteMany({ title: /Unit Test Puzzle/ });
    await mongoose.connection.close();
  });

  it('Unit test za registraciju korisnika - happy flow', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser_reg', email: 'testuser_reg@gmail.com', password: 'test1234' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('testuser_reg@gmail.com');
  });

  it('Unit test za prijavu korisnika - happy flow', async () => {
   
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser_login', email: 'testuser_login@gmail.com', password: 'test1234' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser_login@gmail.com', password: 'test1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('Unit test za prijavu korisnika - neuspešna prijava', async () => {
    
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser_fail', email: 'testuser_fail@gmail.com', password: 'test1234' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser_fail@gmail.com', password: 'pogresna' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/neispravni podaci za prijavu/i);
  });

  it('Unit test za kreiranje slagalice od strane admina', async () => {
    const res = await request(app)
      .post('/api/puzzles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Unit Test Puzzle',
        description: 'Opis za test',
        category: 'logika',
        difficulty: 'easy',
        question: '1+1=?',
        correctAnswer: '2',
        options: ['1', '2', '3'],
        explanation: '1+1=2',
        points: 5,
        isActive: true
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.puzzle).toBeDefined();
    puzzleId = res.body.puzzle._id;
  });

  it('Unit test za rešavanje slagalice - tačan odgovor', async () => {
    
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser_solve', email: 'testuser_solve@gmail.com', password: 'test1234' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser_solve@gmail.com', password: 'test1234' });
    const tokenSolve = loginRes.body.token;
    
    const puzzleRes = await request(app)
      .post('/api/puzzles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Unit Test Puzzle',
        description: 'Opis za test',
        category: 'logika',
        difficulty: 'easy',
        question: '1+1=?',
        correctAnswer: '2',
        options: ['1', '2', '3'],
        explanation: '1+1=2',
        points: 5,
        isActive: true
      });
    const puzzleIdSolve = puzzleRes.body.puzzle._id;
    
    const res = await request(app)
      .post(`/api/puzzles/${puzzleIdSolve}/solve`)
      .set('Authorization', `Bearer ${tokenSolve}`)
      .send({ userAnswer: '2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.isCorrect).toBe(true);
    expect(res.body.pointsEarned).toBe(5);
  });

  it('Unit test za rešavanje slagalice - netačan odgovor', async () => {
    
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser_wrong', email: 'testuser_wrong@gmail.com', password: 'test1234' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser_wrong@gmail.com', password: 'test1234' });
    const tokenWrong = loginRes.body.token;
    
    const puzzleRes = await request(app)
      .post('/api/puzzles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Unit Test Puzzle',
        description: 'Opis za test',
        category: 'logika',
        difficulty: 'easy',
        question: '1+1=?',
        correctAnswer: '2',
        options: ['1', '2', '3'],
        explanation: '1+1=2',
        points: 5,
        isActive: true
      });
    const puzzleIdWrong = puzzleRes.body.puzzle._id;
    
    const res = await request(app)
      .post(`/api/puzzles/${puzzleIdWrong}/solve`)
      .set('Authorization', `Bearer ${tokenWrong}`)
      .send({ userAnswer: '3' });
    expect(res.statusCode).toBe(200);
    expect(res.body.isCorrect).toBe(false);
    expect(res.body.pointsEarned).toBe(0);
  });
});
