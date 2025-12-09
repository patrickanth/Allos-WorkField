// Script to create the admin user and default team
// Run with: node scripts/seed-user.js

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');

async function seedData() {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Create default team
  let teams = [];
  if (fs.existsSync(TEAMS_FILE)) {
    try {
      teams = JSON.parse(fs.readFileSync(TEAMS_FILE, 'utf-8'));
    } catch (e) {
      teams = [];
    }
  }

  const teamId = 'team-default';
  let existingTeam = teams.find(t => t.id === teamId);

  if (!existingTeam) {
    const defaultTeam = {
      id: teamId,
      name: 'Team Patrick',
      slug: 'team-patrick',
      inviteCode: 'ALLOS2024',
      settings: {
        allowMemberInvites: true,
        requireApproval: false,
        defaultTicketPriority: 'medium',
        ticketCategories: ['Bug', 'Feature', 'Support', 'Altro']
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    teams.push(defaultTeam);
    fs.writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2));
    console.log('✓ Default team created!');
    console.log('  Name:', defaultTeam.name);
    console.log('  Invite Code:', defaultTeam.inviteCode);
  } else {
    console.log('✓ Default team already exists');
  }

  // Create admin user
  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    try {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    } catch (e) {
      users = [];
    }
  }

  const adminEmail = 'patrickanthonystudio@gmail.com';
  const adminPassword = 'dev123@@';
  const adminName = 'Patrick';

  const existingUser = users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());

  if (existingUser) {
    // Update teamId if null
    if (!existingUser.teamId) {
      existingUser.teamId = teamId;
      existingUser.id = 'admin-patrick';
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      console.log('✓ Admin user updated with team');
    } else {
      console.log('✓ Admin user already exists');
    }
    console.log('  Email:', adminEmail);
    console.log('  Password:', adminPassword);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = {
    id: 'admin-patrick',
    email: adminEmail,
    password: hashedPassword,
    name: adminName,
    role: 'admin',
    teamId: teamId,
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

seedData().catch(console.error);
