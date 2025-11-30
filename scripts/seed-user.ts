// Script to create a dev user
// Run with: npx ts-node scripts/seed-user.ts
// Or use the API endpoint below

import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  }

  // Check if dev user exists
  const devEmail = 'dev@workfield.local';
  const existingUser = users.find((u: { email: string }) => u.email === devEmail);

  if (existingUser) {
    console.log('Dev user already exists');
    console.log('Email:', devEmail);
    console.log('Password: dev123456');
    return;
  }

  // Create dev user
  const hashedPassword = await bcrypt.hash('dev123456', 12);

  const devUser = {
    id: uuidv4(),
    email: devEmail,
    password: hashedPassword,
    name: 'Developer',
    role: 'admin',
    teamId: null,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.push(devUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  console.log('Dev user created!');
  console.log('Email:', devEmail);
  console.log('Password: dev123456');
}

seedUser().catch(console.error);
