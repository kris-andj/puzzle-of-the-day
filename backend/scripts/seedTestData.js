const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Puzzle = require('../models/Puzzle');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/slagalica';

const users = [
  {
    username: 'krisandj',
    email: 'krisandj@gmail.com',
    password: 'krisandj',
    role: 'user'
  },
  {
    username: 'nikola',
    email: 'nikola@gmai.com',
    password: 'nikola',
    role: 'user'
  },
  {
    username: 'admin',
    email: 'admin@admin.com',
    password: 'admin123',
    role: 'admin'
  }
];

const puzzles = [
  
  {
    title: 'Dnevna slagalica',
    description: 'Zbir dva broja je 10. Koja su to dva broja ako je jedan 7?',
    category: 'matematika',
    difficulty: 'easy',
    question: 'Zbir dva broja je 10. Koja su to dva broja ako je jedan 7?',
    correctAnswer: '7 i 3',
    options: ['7 i 2', '7 i 3', '6 i 4', '5 i 5'],
    explanation: 'Ako je jedan broj 7, drugi je 10-7=3.',
    points: 10,
    isActive: true
  },
  
  {
    title: 'Logička slagalica',
    description: 'Koja figura dolazi sledeća u nizu?',
    category: 'logika',
    difficulty: 'medium',
    question: 'Koja figura dolazi sledeća u nizu: kvadrat, krug, kvadrat, krug, ...?',
    correctAnswer: 'kvadrat',
    options: ['krug', 'trougao', 'kvadrat', 'pravougaonik'],
    explanation: 'Niz se ponavlja: kvadrat, krug, kvadrat, krug...',
    points: 15,
    isActive: true
  },
  {
    title: 'Reč slagalica',
    description: 'Koja reč nedostaje?',
    category: 'reči',
    difficulty: 'easy',
    question: 'Ana ___ Milu.',
    correctAnswer: 'voli',
    options: ['voli', 'jede', 'pije', 'gleda'],
    explanation: 'Pravilno je: Ana voli Milu.',
    points: 10,
    isActive: true
  },
  {
    title: 'Kviz znanja',
    description: 'Glavni grad Francuske?',
    category: 'znanje',
    difficulty: 'easy',
    question: 'Koji je glavni grad Francuske?',
    correctAnswer: 'Pariz',
    options: ['London', 'Berlin', 'Pariz', 'Madrid'],
    explanation: 'Pariz je glavni grad Francuske.',
    points: 10,
    isActive: true
  },
  {
    title: 'Kombinatorika',
    description: 'Na koliko načina možeš rasporediti 3 knjige na polici?',
    category: 'kombinatorika',
    difficulty: 'medium',
    question: 'Na koliko načina možeš rasporediti 3 knjige na polici?',
    correctAnswer: '6',
    options: ['3', '6', '9', '12'],
    explanation: '3! = 3x2x1 = 6 načina.',
    points: 15,
    isActive: true
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Povezano na bazu!');

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      await User.create({
        username: u.username,
        email: u.email,
        password: hash,
        role: u.role
      });
      console.log(`Korisnik ${u.username} kreiran.`);
    }

    for (const p of puzzles) {
      await Puzzle.create(p);
      console.log(`Slagalica '${p.title}' kreirana.`);
    }

    console.log('Unos završen!');
    process.exit(0);
  } catch (err) {
    console.error('Greška pri unosu:', err);
    process.exit(1);
  }
}

seed();
