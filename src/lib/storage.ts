import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { User, Team, Note, Ticket, TableConfig, TableColumn } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');
const TABLE_CONFIGS_FILE = path.join(DATA_DIR, 'table-configs.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Generic read/write functions
function readData<T>(filePath: string): T[] {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeData<T>(filePath: string, data: T[]): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// User operations
export const users = {
  getAll: (): User[] => readData<User>(USERS_FILE),

  getById: (id: string): User | undefined => {
    const allUsers = readData<User>(USERS_FILE);
    return allUsers.find(u => u.id === id);
  },

  getByEmail: (email: string): User | undefined => {
    const allUsers = readData<User>(USERS_FILE);
    return allUsers.find(u => u.email === email);
  },

  create: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const allUsers = readData<User>(USERS_FILE);
    const newUser: User = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    allUsers.push(newUser);
    writeData(USERS_FILE, allUsers);
    return newUser;
  },

  update: (id: string, data: Partial<User>): User | undefined => {
    const allUsers = readData<User>(USERS_FILE);
    const index = allUsers.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    allUsers[index] = {
      ...allUsers[index],
      ...data,
      updatedAt: new Date(),
    };
    writeData(USERS_FILE, allUsers);
    return allUsers[index];
  },

  delete: (id: string): boolean => {
    const allUsers = readData<User>(USERS_FILE);
    const filtered = allUsers.filter(u => u.id !== id);
    if (filtered.length === allUsers.length) return false;
    writeData(USERS_FILE, filtered);
    return true;
  },

  getByTeam: (teamId: string): User[] => {
    const allUsers = readData<User>(USERS_FILE);
    return allUsers.filter(u => u.teamId === teamId);
  },
};

// Team operations
export const teams = {
  getAll: (): Team[] => readData<Team>(TEAMS_FILE),

  getById: (id: string): Team | undefined => {
    const allTeams = readData<Team>(TEAMS_FILE);
    return allTeams.find(t => t.id === id);
  },

  getBySlug: (slug: string): Team | undefined => {
    const allTeams = readData<Team>(TEAMS_FILE);
    return allTeams.find(t => t.slug === slug);
  },

  getByInviteCode: (code: string): Team | undefined => {
    const allTeams = readData<Team>(TEAMS_FILE);
    return allTeams.find(t => t.inviteCode === code);
  },

  create: (data: Omit<Team, 'id' | 'inviteCode' | 'createdAt' | 'updatedAt'>): Team => {
    const allTeams = readData<Team>(TEAMS_FILE);
    const newTeam: Team = {
      ...data,
      id: uuidv4(),
      inviteCode: uuidv4().substring(0, 8).toUpperCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    allTeams.push(newTeam);
    writeData(TEAMS_FILE, allTeams);
    return newTeam;
  },

  update: (id: string, data: Partial<Team>): Team | undefined => {
    const allTeams = readData<Team>(TEAMS_FILE);
    const index = allTeams.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    allTeams[index] = {
      ...allTeams[index],
      ...data,
      updatedAt: new Date(),
    };
    writeData(TEAMS_FILE, allTeams);
    return allTeams[index];
  },

  delete: (id: string): boolean => {
    const allTeams = readData<Team>(TEAMS_FILE);
    const filtered = allTeams.filter(t => t.id !== id);
    if (filtered.length === allTeams.length) return false;
    writeData(TEAMS_FILE, filtered);
    return true;
  },

  regenerateInviteCode: (id: string): Team | undefined => {
    return teams.update(id, { inviteCode: uuidv4().substring(0, 8).toUpperCase() });
  },
};

// Note operations
export const notes = {
  getAll: (): Note[] => readData<Note>(NOTES_FILE),

  getById: (id: string): Note | undefined => {
    const allNotes = readData<Note>(NOTES_FILE);
    return allNotes.find(n => n.id === id);
  },

  getByAuthor: (authorId: string): Note[] => {
    const allNotes = readData<Note>(NOTES_FILE);
    return allNotes.filter(n => n.authorId === authorId);
  },

  getByTeam: (teamId: string): Note[] => {
    const allNotes = readData<Note>(NOTES_FILE);
    return allNotes.filter(n => n.teamId === teamId && !n.isPrivate);
  },

  getPrivateByAuthor: (authorId: string): Note[] => {
    const allNotes = readData<Note>(NOTES_FILE);
    return allNotes.filter(n => n.authorId === authorId && n.isPrivate);
  },

  getSharedByTeam: (teamId: string): Note[] => {
    const allNotes = readData<Note>(NOTES_FILE);
    return allNotes.filter(n => n.teamId === teamId && !n.isPrivate);
  },

  create: (data: Omit<Note, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>): Note => {
    const allNotes = readData<Note>(NOTES_FILE);
    const newNote: Note = {
      ...data,
      id: uuidv4(),
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    allNotes.push(newNote);
    writeData(NOTES_FILE, allNotes);
    return newNote;
  },

  update: (id: string, data: Partial<Note>): Note | undefined => {
    const allNotes = readData<Note>(NOTES_FILE);
    const index = allNotes.findIndex(n => n.id === id);
    if (index === -1) return undefined;

    allNotes[index] = {
      ...allNotes[index],
      ...data,
      updatedAt: new Date(),
    };
    writeData(NOTES_FILE, allNotes);
    return allNotes[index];
  },

  delete: (id: string): boolean => {
    const allNotes = readData<Note>(NOTES_FILE);
    const filtered = allNotes.filter(n => n.id !== id);
    if (filtered.length === allNotes.length) return false;
    writeData(NOTES_FILE, filtered);
    return true;
  },

  togglePrivacy: (id: string): Note | undefined => {
    const note = notes.getById(id);
    if (!note) return undefined;
    return notes.update(id, { isPrivate: !note.isPrivate });
  },
};

// Ticket operations
export const tickets = {
  getAll: (): Ticket[] => readData<Ticket>(TICKETS_FILE),

  getById: (id: string): Ticket | undefined => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    return allTickets.find(t => t.id === id);
  },

  getByTeam: (teamId: string): Ticket[] => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    return allTickets.filter(t => t.teamId === teamId);
  },

  getByAuthor: (authorId: string): Ticket[] => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    return allTickets.filter(t => t.authorId === authorId);
  },

  getByAssignee: (assigneeId: string): Ticket[] => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    return allTickets.filter(t => t.assigneeId === assigneeId);
  },

  create: (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Ticket => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    const newTicket: Ticket = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    allTickets.push(newTicket);
    writeData(TICKETS_FILE, allTickets);
    return newTicket;
  },

  update: (id: string, data: Partial<Ticket>): Ticket | undefined => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    const index = allTickets.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    allTickets[index] = {
      ...allTickets[index],
      ...data,
      updatedAt: new Date(),
    };
    writeData(TICKETS_FILE, allTickets);
    return allTickets[index];
  },

  delete: (id: string): boolean => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    const filtered = allTickets.filter(t => t.id !== id);
    if (filtered.length === allTickets.length) return false;
    writeData(TICKETS_FILE, filtered);
    return true;
  },
};

// Table Config operations
export const tableConfigs = {
  getAll: (): TableConfig[] => readData<TableConfig>(TABLE_CONFIGS_FILE),

  getById: (id: string): TableConfig | undefined => {
    const allConfigs = readData<TableConfig>(TABLE_CONFIGS_FILE);
    return allConfigs.find(c => c.id === id);
  },

  getByTeam: (teamId: string): TableConfig[] => {
    const allConfigs = readData<TableConfig>(TABLE_CONFIGS_FILE);
    return allConfigs.filter(c => c.teamId === teamId);
  },

  getDefaultByTeam: (teamId: string): TableConfig | undefined => {
    const allConfigs = readData<TableConfig>(TABLE_CONFIGS_FILE);
    return allConfigs.find(c => c.teamId === teamId && c.isDefault);
  },

  create: (data: { name: string; columns: TableColumn[]; teamId: string; isDefault?: boolean }): TableConfig => {
    const allConfigs = readData<TableConfig>(TABLE_CONFIGS_FILE);
    const newConfig: TableConfig = {
      ...data,
      id: uuidv4(),
      isDefault: data.isDefault ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    allConfigs.push(newConfig);
    writeData(TABLE_CONFIGS_FILE, allConfigs);
    return newConfig;
  },

  update: (id: string, data: Partial<TableConfig>): TableConfig | undefined => {
    const allConfigs = readData<TableConfig>(TABLE_CONFIGS_FILE);
    const index = allConfigs.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    allConfigs[index] = {
      ...allConfigs[index],
      ...data,
      updatedAt: new Date(),
    };
    writeData(TABLE_CONFIGS_FILE, allConfigs);
    return allConfigs[index];
  },

  delete: (id: string): boolean => {
    const allConfigs = readData<TableConfig>(TABLE_CONFIGS_FILE);
    const filtered = allConfigs.filter(c => c.id !== id);
    if (filtered.length === allConfigs.length) return false;
    writeData(TABLE_CONFIGS_FILE, filtered);
    return true;
  },
};

// Initialize default table config for a team
export function initializeDefaultTableConfig(teamId: string): TableConfig {
  const existing = tableConfigs.getDefaultByTeam(teamId);
  if (existing) return existing;

  const defaultColumns: TableColumn[] = [
    { id: uuidv4(), name: 'Nome Ticket', type: 'text', required: true },
    { id: uuidv4(), name: 'Descrizione', type: 'text', required: false },
    { id: uuidv4(), name: 'Stato', type: 'select', options: ['Aperto', 'In Corso', 'Risolto', 'Chiuso'], required: true },
    { id: uuidv4(), name: 'Priorità', type: 'select', options: ['Bassa', 'Media', 'Alta', 'Critica'], required: true },
    { id: uuidv4(), name: 'Tempo di Reazione (min)', type: 'number', required: false },
    { id: uuidv4(), name: 'Tempo di Risoluzione (min)', type: 'number', required: false },
    { id: uuidv4(), name: 'Data Creazione', type: 'date', required: true },
  ];

  return tableConfigs.create({
    name: 'Configurazione Default',
    columns: defaultColumns,
    teamId,
    isDefault: true,
  });
}
