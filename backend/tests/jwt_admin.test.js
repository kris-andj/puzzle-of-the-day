const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');



describe('Integracioni test - JWT zaštita admin rute', () => {
  let adminToken, userToken;

  beforeAll(async () => {
    await User.deleteMany({ email: /testjwt/ });
    
    await User.create({ username: 'testjwtadmin', email: 'testjwtadmin@gmail.com', password: 'admin123', role: 'admin' });
    
    await User.create({ username: 'testjwtuser', email: 'testjwtuser@gmail.com', password: 'user123', role: 'user' });
    
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testjwtadmin@gmail.com', password: 'admin123' });
    adminToken = adminRes.body.token;
    
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testjwtuser@gmail.com', password: 'user123' });
    userToken = userRes.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /testjwt/ });
    await mongoose.connection.close();
  });

  it('dozvoljava pristup adminu na admin rutu', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('zabranjuje pristup obicnom korisniku na admin rutu', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  expect(res.body.message).toMatch(/admin privilegije/i);
  });

  it('zabranjuje pristup bez tokena na admin rutu', async () => {
    const res = await request(app)
      .get('/api/users');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });
});
