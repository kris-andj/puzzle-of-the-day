
require('dotenv').config();
const mongoose = require('mongoose');
const Puzzle = require('../models/Puzzle');
const User = require('../models/User');

async function createTestPuzzle() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MongoDB URI found in environment variables.');
    process.exit(1);
  }
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  
  const admin = await User.findOne({ email: 'admin@gmail.com' });
  if (!admin) {
    console.error('Admin user not found.');
    process.exit(1);
  }

  const exists = await Puzzle.findOne({ title: 'Test Puzzle' });
  if (exists) {
    console.log('Test puzzle already exists');
    process.exit(0);
  }

  const puzzle = new Puzzle({
    title: 'Test Puzzle',
    description: 'Ovo je dnevna slagalica za proveru sistema.',
    category: 'logika',
    difficulty: 'easy',
    question: 'Koji broj nedostaje u nizu: 2, 4, 6, ?',
    correctAnswer: '8',
    options: ['6', '7', '8', '9'],
    explanation: 'Niz raste za 2: 2, 4, 6, 8.',
    points: 10,
    isActive: true,
    dateUsed: null,
    createdBy: admin._id
  });
  await puzzle.save();
  console.log('Test puzzle created');
  process.exit(0);
}

createTestPuzzle().catch(e => { console.error(e); process.exit(1); });
