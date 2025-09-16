
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function deleteAdmin() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MongoDB URI found in environment variables.');
    process.exit(1);
  }
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const result = await User.deleteMany({ username: 'admin' });
  console.log(`Deleted ${result.deletedCount} admin user(s).`);
  process.exit(0);
}

deleteAdmin().catch(e => { console.error(e); process.exit(1); });
