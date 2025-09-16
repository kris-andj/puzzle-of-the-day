const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Puzzle = require('../models/Puzzle');

let adminToken;

beforeAll(async () => {
    
    await User.deleteMany({});
    await Puzzle.deleteMany({});
    await request(app)
        .post('/api/auth/register')
        .send({ username: 'admin', password: 'admin123', email: 'admin@test.com', role: 'admin' });
    const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });
    adminToken = res.body.token;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Batch upload puzzles (admin)', () => {
    it('should upload multiple puzzles at once', async () => {
        const puzzles = [
            {
                title: 'Slagalica 1',
                question: 'Pitanje 1',
                correctAnswer: 'Odgovor 1',
                category: 'Opšte',
                difficulty: 'lako',
                points: 10
            },
            {
                title: 'Slagalica 2',
                question: 'Pitanje 2',
                correctAnswer: 'Odgovor 2',
                category: 'Opšte',
                difficulty: 'srednje',
                points: 20
            }
        ];
        const res = await request(app)
            .post('/api/puzzles/batch')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ puzzles });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(2);
        expect(Array.isArray(res.body.puzzles)).toBe(true);
        expect(res.body.puzzles[0]).toHaveProperty('title', 'Slagalica 1');
        expect(res.body.puzzles[1]).toHaveProperty('title', 'Slagalica 2');
    });

    it('should fail if no puzzles are sent', async () => {
        const res = await request(app)
            .post('/api/puzzles/batch')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ puzzles: [] });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/nijednu slagalicu/i);
    });
});
