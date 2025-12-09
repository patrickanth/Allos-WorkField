// Script to create the admin user
// Run with: node scripts/seed-user.js

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function seedUser() {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Read existing users
  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    try {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    } catch (e) {
      users = [];
    }
  }

  // Admin user credentials
  const adminEmail = 'patrickanthonystudio@gmail.com';
  const adminPassword = 'dev123@@';
  const adminName = 'Patrick';

  // Check if admin user exists
  const existingUser = users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());

  if (existingUser) {
    console.log('✓ Admin user already exists');
    console.log('  Email:', adminEmail);
    console.log('  Password:', adminPassword);
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = {
    id: uuidv4(),
    email: adminEmail,
    password: hashedPassword,
    name: adminName,
    role: 'admin',
    teamId: null,
    avatar: null,
    preferences: {
      darkMode: true,
      notifications: true,
      emailNotifications: false,
      language: 'it',
      compactView: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(adminUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  console.log('✓ Admin user created!');
  console.log('  Email:', adminEmail);
  console.log('  Password:', adminPassword);
}

seedUser().catch(console.error);
