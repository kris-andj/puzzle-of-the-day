

const mongoose = require('mongoose');
const User = require('../models/User');
const Puzzle = require('../models/Puzzle');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Povezan na bazu:', mongoose.connection.name);

  
  await User.deleteMany({});
  await Puzzle.deleteMany({});

  
  const admin = await User.create({
    username: 'admin',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
    stats: { totalSolved: 0, correctAnswers: 0, totalPoints: 0, streak: 0, lastActiveDate: null },
    preferences: { favoriteCategories: [], difficulty: 'medium', notifications: true }
  });

  
  const krisandj = await User.create({
    username: 'krisandj',
    email: 'krisandj@gmail.com',
    password: 'krisandj',
    role: 'user',
    stats: { totalSolved: 0, correctAnswers: 0, totalPoints: 0, streak: 0, lastActiveDate: null },
    preferences: { favoriteCategories: [], difficulty: 'medium', notifications: true }
  });

  
  const nikola = await User.create({
    username: 'nikola',
    email: 'nikola@gmail.com',
    password: 'nikola',
    role: 'user',
    stats: { totalSolved: 0, correctAnswers: 0, totalPoints: 0, streak: 0, lastActiveDate: null },
    preferences: { favoriteCategories: [], difficulty: 'medium', notifications: true }
  });

  
  const puzzles = [
    
    {
      title: 'Stohastički proces',
      description: 'Analiziraj složen problem verovatnoće sa uslovnim verovatnoćama.',
      category: 'kombinatorika',
      difficulty: 'hard',
      question: 'U kutiji je 12 loptica: 5 crvenih, 4 plave i 3 zelene. Izvlačiš 3 loptice bez vraćanja. Kolika je verovatnoća da izvučeš jednu crvenu, jednu plavu i jednu zelenu?',
      correctAnswer: '3/11',
      options: ['1/11', '3/11', '1/12', '1/6'],
      explanation: 'P = (5×4×3)/(C(12,3)) = 60/220 = 3/11. Brojilac: 5 crvenih × 4 plave × 3 zelene. Znamnik: broj načina da izvučeš 3 loptice od 12.',
      points: 30,
      isActive: true,
      dateUsed: null,
      createdBy: admin._id
    },
    {
      title: 'Permutacije sa ponavljanjem',
      description: 'Kombinatorni zadatak o permutacijama sa ponavljanjem.',
      category: 'kombinatorika',
      difficulty: 'medium',
      question: 'Koliko različitih reči se može formirati od slova reči "MAMA"?',
      correctAnswer: '12',
      options: ['24', '12', '6', '8'],
      explanation: 'Permutacije sa ponavljanjem: 4!/(2!2!) = 24/4 = 6. Ali imamo 2 M i 2 A, pa je broj reči 12.',
      points: 15,
      isActive: true,
      dateUsed: null,
      createdBy: admin._id
    },
    
    {
      title: 'Glavni grad Francuske',
      description: 'Geografska slagalica o glavnim gradovima.',
      category: 'znanje',
      difficulty: 'easy',
      question: 'Koji je glavni grad Francuske?',
      correctAnswer: 'Pariz',
      options: ['London', 'Berlin', 'Pariz', 'Madrid'],
      explanation: 'Pariz je glavni grad Francuske.',
      points: 10,
      isActive: true,
      dateUsed: null,
      createdBy: admin._id
    },
    {
      title: 'Najveća reka sveta',
      description: 'Pitanje iz oblasti geografije.',
      category: 'znanje',
      difficulty: 'medium',
      question: 'Koja reka je najduža na svetu?',
      correctAnswer: 'Nil',
      options: ['Amazon', 'Nil', 'Dunav', 'Misisipi'],
      explanation: 'Nil je najduža reka na svetu, iako Amazon ima veći protok vode.',
      points: 15,
      isActive: true,
      dateUsed: null,
      createdBy: admin._id
    },

    {
      title: 'Saberi brojeve',
      description: 'Jednostavan matematički zadatak.',
      category: 'matematika',
      difficulty: 'easy',
      question: 'Koliko je 2 + 2?',
      correctAnswer: '4',
      options: ['3', '4', '5', '6'],
      explanation: '2 + 2 = 4.',
      points: 5,
      isActive: true,
      dateUsed: null,
      createdBy: admin._id
    },
    {
      title: 'Kvadrat broja',
      description: 'Matematički zadatak o kvadriranju.',
      category: 'matematika',
      difficulty: 'medium',
      question: 'Koliko je kvadrat broja 7?',
      correctAnswer: '49',
      options: ['14', '49', '21', '77'],
      explanation: '7 × 7 = 49.',
      points: 10,
      isActive: true,
      dateUsed: null,
      createdBy: admin._id
    },
    
    {
      title: 'Logički niz',
      description: 'Pronađi sledeći broj u logičkom nizu.',
      category: 'logika',
      difficulty: 'easy',
      question: 'Koji broj dolazi sledeći: 2, 4, 8, 16, ?',
      correctAnswer: '32',
      options: ['24', '32', '20', '18'],
      explanation: 'Svaki sledeći broj je prethodni ×2.',
      points: 10,
      isActive: true,
      dateUsed: null,
      createdBy: admin._id
    },
    {
      title: 'Istina ili laž',
      description: 'Logička slagalica o istinitosti tvrdnji.',
      category: 'logika',
      difficulty: 'medium',
      question: 'Ako je tvrdnja "Ova rečenica je laž" istinita, da li je ona zapravo laž?',
      correctAnswer: 'Paradox',
      options: ['Da', 'Ne', 'Paradox', 'Nije moguće odrediti'],
      explanation: 'Ova rečenica je poznata kao lažov paradoks.',
      points: 15,
      isActive: true,
      dateUsed: null,
      createdBy: admin._id
    },
    
    {
      title: 'Sinonim za "lep"',
      description: 'Pronađi sinonim za zadatu reč.',
      category: 'reči',
      difficulty: 'easy',
      question: 'Koji je sinonim za reč "lep"?',
      correctAnswer: 'zgodan',
      options: ['ružan', 'zgodan', 'dosadan', 'pametan'],
      explanation: 'Sinonim za "lep" je "zgodan".',
      points: 10,
      isActive: true,
      dateUsed: null,
      createdBy: admin._id
    },
    {
      title: 'Anagram',
      description: 'Pronađi reč koja je anagram reči "mora".',
      category: 'reči',
      difficulty: 'medium',
      question: 'Koja reč je anagram reči "mora"?',
      correctAnswer: 'Roma',
      options: ['Amor', 'Roma', 'Maro', 'Omar'],
      explanation: 'Roma je anagram reči mora.',
      points: 15,
      isActive: true,
      dateUsed: null,
      createdBy: admin._id
    }
  ];
  await Puzzle.insertMany(puzzles);

  console.log('✅ Baza je popunjena sa korisnicima i slagalicama!');
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
