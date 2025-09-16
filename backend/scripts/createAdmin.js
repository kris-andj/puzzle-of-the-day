// Script to insert a test admin user into the database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/slagalicaTest';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const email = 'admin@admin.com';
  const username = 'admin';
  const password = 'admin123';
  
  await User.deleteOne({ $or: [{ email }, { username }] });
  
  const user = new User({
    username,
    email,
    password,
    role: 'admin'
  });
  await user.save();
  console.log('Admin user created');
  process.exit(0);
}

createAdmin().catch(e => { console.error(e); process.exit(1); });
