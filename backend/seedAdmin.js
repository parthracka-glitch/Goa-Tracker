// Run once: node seedAdmin.js
// Creates (or resets) the single admin account from your .env values.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD in .env first.');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);

  await Admin.findOneAndUpdate(
    { username },
    { username, password: hashed },
    { upsert: true, new: true }
  );

  console.log(`Admin account ready: ${username}`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
