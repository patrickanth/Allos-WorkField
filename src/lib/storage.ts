// ═══════════════════════════════════════════════════════════════════════════
// ALLOS WORKFIELD - STORAGE LAYER
// JSON file-based storage for all application data
// ═══════════════════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  User,
  UserWithPassword,
  UserPreferences,
  Team,
  Note,
  NoteColor,
  Ticket,
  TicketComment,
  TicketActivity,
  CalendarEvent,
  Activity,
  ActivityType,
  Notification,
  TableConfig,
  TableColumn,
} from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// FILE PATHS
// ─────────────────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const TABLE_CONFIGS_FILE = path.join(DATA_DIR, 'table-configs.json');

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readData<T>(filePath: string): T[] {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeData<T>(filePath: string, data: T[]): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function generateInviteCode(): string {
  return uuidv4().substring(0, 8).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// USER OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  notifications: true,
  emailNotifications: false,
  soundEnabled: true,
  language: 'it',
};

export const users = {
  getAll: (): User[] => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    return allUsers.map(({ password: _, ...user }) => user);
  },

  getById: (id: string): User | undefined => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    const user = allUsers.find(u => u.id === id);
    if (!user) return undefined;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  getByEmail: (email: string): User | undefined => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return undefined;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  getByEmailWithPassword: (email: string): UserWithPassword | undefined => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    return allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getByIdWithPassword: (id: string): UserWithPassword | undefined => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    return allUsers.find(u => u.id === id);
  },

  getByTeam: (teamId: string): User[] => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    return allUsers
      .filter(u => u.teamId === teamId)
      .map(({ password: _, ...user }) => user);
  },

  create: (data: Omit<UserWithPassword, 'id' | 'createdAt' | 'updatedAt' | 'preferences'>): User => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    const newUser: UserWithPassword = {
      ...data,
      id: uuidv4(),
      preferences: defaultPreferences,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    allUsers.push(newUser);
    writeData(USERS_FILE, allUsers);
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  update: (id: string, data: Partial<UserWithPassword>): User | undefined => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    const index = allUsers.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    allUsers[index] = {
      ...allUsers[index],
      ...data,
      updatedAt: new Date(),
    };
    writeData(USERS_FILE, allUsers);
    const { password: _, ...userWithoutPassword } = allUsers[index];
    return userWithoutPassword;
  },

  updatePassword: (id: string, hashedPassword: string): boolean => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    const index = allUsers.findIndex(u => u.id === id);
    if (index === -1) return false;

    allUsers[index] = {
      ...allUsers[index],
      password: hashedPassword,
      updatedAt: new Date(),
    };
    writeData(USERS_FILE, allUsers);
    return true;
  },

  updatePreferences: (id: string, preferences: Partial<UserPreferences>): User | undefined => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    const index = allUsers.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    allUsers[index] = {
      ...allUsers[index],
      preferences: {
        ...defaultPreferences,
        ...allUsers[index].preferences,
        ...preferences,
      },
      updatedAt: new Date(),
    };
    writeData(USERS_FILE, allUsers);
    const { password: _, ...userWithoutPassword } = allUsers[index];
    return userWithoutPassword;
  },

  delete: (id: string): boolean => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    const filtered = allUsers.filter(u => u.id !== id);
    if (filtered.length === allUsers.length) return false;
    writeData(USERS_FILE, filtered);
    return true;
  },

  updateLastActive: (id: string): void => {
    const allUsers = readData<UserWithPassword>(USERS_FILE);
    const index = allUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      allUsers[index].lastActiveAt = new Date();
      writeData(USERS_FILE, allUsers);
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEAM OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

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
    return allTeams.find(t => t.inviteCode.toUpperCase() === code.toUpperCase());
  },

  getWithMembers: (id: string): (Team & { members: User[] }) | undefined => {
    const team = teams.getById(id);
    if (!team) return undefined;
    const members = users.getByTeam(id);
    return { ...team, members };
  },

  create: (data: Omit<Team, 'id' | 'inviteCode' | 'createdAt' | 'updatedAt'>): Team => {
    const allTeams = readData<Team>(TEAMS_FILE);
    const newTeam: Team = {
      ...data,
      id: uuidv4(),
      inviteCode: generateInviteCode(),
      settings: data.settings || {
        allowMemberInvites: false,
        requireApproval: false,
        defaultTicketPriority: 'medium',
        ticketCategories: ['Bug', 'Feature', 'Support', 'Altro'],
      },
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
    return teams.update(id, { inviteCode: generateInviteCode() });
  },

  removeMember: (teamId: string, userId: string): boolean => {
    const user = users.getById(userId);
    if (!user || user.teamId !== teamId) return false;
    users.update(userId, { teamId: null, role: 'member' });
    return true;
  },

  getStats: (teamId: string) => {
    const members = users.getByTeam(teamId);
    const teamNotes = notes.getByTeam(teamId);
    const teamTickets = tickets.getByTeam(teamId);

    const resolvedTickets = teamTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((acc, t) => acc + (t.resolutionTime || 0), 0) / resolvedTickets.length
      : 0;

    return {
      totalMembers: members.length,
      totalNotes: teamNotes.length,
      totalTickets: teamTickets.length,
      openTickets: teamTickets.filter(t => t.status === 'open').length,
      resolvedTickets: resolvedTickets.length,
      avgResolutionTime: Math.round(avgResolutionTime),
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

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

  getByUser: (userId: string): Note[] => {
    const allNotes = readData<Note>(NOTES_FILE);
    return allNotes.filter(n => n.authorId === userId);
  },

  getByTeam: (teamId: string): Note[] => {
    const allNotes = readData<Note>(NOTES_FILE);
    return allNotes.filter(n => n.teamId === teamId && !n.isPrivate);
  },

  getPrivateByAuthor: (authorId: string): Note[] => {
    const allNotes = readData<Note>(NOTES_FILE);
    return allNotes
      .filter(n => n.authorId === authorId && n.isPrivate)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  },

  getSharedByTeam: (teamId: string): Note[] => {
    const allNotes = readData<Note>(NOTES_FILE);
    return allNotes
      .filter(n => n.teamId === teamId && !n.isPrivate)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  },

  getCategories: (authorId: string, teamId?: string | null): string[] => {
    const allNotes = readData<Note>(NOTES_FILE);
    const relevantNotes = allNotes.filter(n =>
      n.authorId === authorId || (teamId && n.teamId === teamId && !n.isPrivate)
    );
    const categories = new Set(relevantNotes.map(n => n.category).filter(Boolean) as string[]);
    return Array.from(categories);
  },

  getTags: (authorId: string, teamId?: string | null): string[] => {
    const allNotes = readData<Note>(NOTES_FILE);
    const relevantNotes = allNotes.filter(n =>
      n.authorId === authorId || (teamId && n.teamId === teamId && !n.isPrivate)
    );
    const tags = new Set(relevantNotes.flatMap(n => n.tags || []));
    return Array.from(tags);
  },

  create: (data: {
    content: string;
    title?: string;
    isPrivate: boolean;
    color?: NoteColor;
    category?: string;
    tags?: string[];
    authorId: string;
    teamId?: string | null;
  }): Note => {
    const allNotes = readData<Note>(NOTES_FILE);
    const newNote: Note = {
      id: uuidv4(),
      title: data.title || null,
      content: data.content,
      isPrivate: data.isPrivate,
      isPinned: false,
      color: data.color || 'default',
      category: data.category || null,
      tags: data.tags || [],
      authorId: data.authorId,
      teamId: data.isPrivate ? null : data.teamId,
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

    // If changing from private to shared, ensure teamId is set
    if (data.isPrivate === false && allNotes[index].isPrivate) {
      // teamId should be provided in data
    } else if (data.isPrivate === true) {
      data.teamId = null;
    }

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

  togglePin: (id: string): Note | undefined => {
    const note = notes.getById(id);
    if (!note) return undefined;
    return notes.update(id, { isPinned: !note.isPinned });
  },

  togglePrivacy: (id: string, teamId?: string): Note | undefined => {
    const note = notes.getById(id);
    if (!note) return undefined;
    return notes.update(id, {
      isPrivate: !note.isPrivate,
      teamId: note.isPrivate ? teamId : null,
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TICKET OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

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

  getByUser: (userId: string): Ticket[] => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    return allTickets.filter(t => t.authorId === userId);
  },

  getByAssignee: (assigneeId: string): Ticket[] => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    return allTickets.filter(t => t.assigneeId === assigneeId);
  },

  getOverdue: (teamId: string): Ticket[] => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    const now = new Date();
    return allTickets.filter(t =>
      t.teamId === teamId &&
      t.dueDate &&
      new Date(t.dueDate) < now &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    );
  },

  getUpcoming: (teamId: string, days: number = 7): Ticket[] => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return allTickets.filter(t =>
      t.teamId === teamId &&
      t.dueDate &&
      new Date(t.dueDate) >= now &&
      new Date(t.dueDate) <= future &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    );
  },

  create: (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'tags'> & { tags?: string[] }): Ticket => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    const newTicket: Ticket = {
      ...data,
      id: uuidv4(),
      tags: data.tags || [],
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

    const oldTicket = allTickets[index];

    // Track status change for closedAt
    if (data.status && (data.status === 'resolved' || data.status === 'closed') &&
        oldTicket.status !== 'resolved' && oldTicket.status !== 'closed') {
      data.closedAt = new Date();
      // Calculate resolution time in minutes
      const createdAt = new Date(oldTicket.createdAt);
      const closedAt = new Date();
      data.resolutionTime = Math.round((closedAt.getTime() - createdAt.getTime()) / (1000 * 60));
    }

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
    // Also delete related comments and activities
    ticketComments.deleteByTicket(id);
    ticketActivities.deleteByTicket(id);
    return true;
  },

  getCategories: (teamId: string): string[] => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    const teamTickets = allTickets.filter(t => t.teamId === teamId);
    const categories = new Set(teamTickets.map(t => t.category).filter(Boolean) as string[]);
    return Array.from(categories);
  },

  getTags: (teamId: string): string[] => {
    const allTickets = readData<Ticket>(TICKETS_FILE);
    const teamTickets = allTickets.filter(t => t.teamId === teamId);
    const tags = new Set(teamTickets.flatMap(t => t.tags || []));
    return Array.from(tags);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TICKET COMMENT OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const ticketComments = {
  getAll: (): TicketComment[] => readData<TicketComment>(COMMENTS_FILE),

  getByTicket: (ticketId: string): TicketComment[] => {
    const allComments = readData<TicketComment>(COMMENTS_FILE);
    return allComments
      .filter(c => c.ticketId === ticketId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  create: (data: { content: string; ticketId: string; authorId: string }): TicketComment => {
    const allComments = readData<TicketComment>(COMMENTS_FILE);
    const newComment: TicketComment = {
      id: uuidv4(),
      content: data.content,
      ticketId: data.ticketId,
      authorId: data.authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    allComments.push(newComment);
    writeData(COMMENTS_FILE, allComments);
    return newComment;
  },

  update: (id: string, content: string): TicketComment | undefined => {
    const allComments = readData<TicketComment>(COMMENTS_FILE);
    const index = allComments.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    allComments[index] = {
      ...allComments[index],
      content,
      updatedAt: new Date(),
    };
    writeData(COMMENTS_FILE, allComments);
    return allComments[index];
  },

  delete: (id: string): boolean => {
    const allComments = readData<TicketComment>(COMMENTS_FILE);
    const filtered = allComments.filter(c => c.id !== id);
    if (filtered.length === allComments.length) return false;
    writeData(COMMENTS_FILE, filtered);
    return true;
  },

  deleteByTicket: (ticketId: string): void => {
    const allComments = readData<TicketComment>(COMMENTS_FILE);
    const filtered = allComments.filter(c => c.ticketId !== ticketId);
    writeData(COMMENTS_FILE, filtered);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TICKET ACTIVITY OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const ticketActivities = {
  getByTicket: (ticketId: string): TicketActivity[] => {
    const allActivities = readData<TicketActivity>(ACTIVITIES_FILE);
    return allActivities
      .filter(a => a.ticketId === ticketId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  create: (data: Omit<TicketActivity, 'id' | 'createdAt'>): TicketActivity => {
    const allActivities = readData<TicketActivity>(ACTIVITIES_FILE);
    const newActivity: TicketActivity = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    };
    allActivities.push(newActivity);
    writeData(ACTIVITIES_FILE, allActivities);
    return newActivity;
  },

  deleteByTicket: (ticketId: string): void => {
    const allActivities = readData<TicketActivity>(ACTIVITIES_FILE);
    const filtered = allActivities.filter(a => a.ticketId !== ticketId);
    writeData(ACTIVITIES_FILE, filtered);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR EVENT OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const calendarEvents = {
  getAll: (): CalendarEvent[] => readData<CalendarEvent>(EVENTS_FILE),

  getById: (id: string): CalendarEvent | undefined => {
    const allEvents = readData<CalendarEvent>(EVENTS_FILE);
    return allEvents.find(e => e.id === id);
  },

  getByTeam: (teamId: string): CalendarEvent[] => {
    const allEvents = readData<CalendarEvent>(EVENTS_FILE);
    return allEvents.filter(e => e.teamId === teamId);
  },

  getByUser: (userId: string): CalendarEvent[] => {
    const allEvents = readData<CalendarEvent>(EVENTS_FILE);
    return allEvents.filter(e => e.userId === userId);
  },

  getByUserAndTeam: (userId: string, teamId?: string | null): CalendarEvent[] => {
    const allEvents = readData<CalendarEvent>(EVENTS_FILE);
    return allEvents.filter(e => e.userId === userId || (teamId && e.teamId === teamId));
  },

  getByDateRange: (teamId: string | null, start: Date, end: Date): CalendarEvent[] => {
    const allEvents = readData<CalendarEvent>(EVENTS_FILE);
    return allEvents.filter(e => {
      if (teamId && e.teamId !== teamId) return false;
      const eventStart = new Date(e.date);
      return eventStart >= start && eventStart <= end;
    });
  },

  getUpcoming: (teamId: string, days: number = 7): CalendarEvent[] => {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return calendarEvents.getByDateRange(teamId, now, future);
  },

  create: (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): CalendarEvent => {
    const allEvents = readData<CalendarEvent>(EVENTS_FILE);
    const newEvent: CalendarEvent = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allEvents.push(newEvent);
    writeData(EVENTS_FILE, allEvents);
    return newEvent;
  },

  update: (id: string, data: Partial<CalendarEvent>): CalendarEvent | undefined => {
    const allEvents = readData<CalendarEvent>(EVENTS_FILE);
    const index = allEvents.findIndex(e => e.id === id);
    if (index === -1) return undefined;

    allEvents[index] = {
      ...allEvents[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeData(EVENTS_FILE, allEvents);
    return allEvents[index];
  },

  delete: (id: string): boolean => {
    const allEvents = readData<CalendarEvent>(EVENTS_FILE);
    const filtered = allEvents.filter(e => e.id !== id);
    if (filtered.length === allEvents.length) return false;
    writeData(EVENTS_FILE, filtered);
    return true;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY LOG OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const activityLog = {
  getByTeam: (teamId: string, limit: number = 50): Activity[] => {
    const allActivities = readData<Activity>(ACTIVITIES_FILE);
    return allActivities
      .filter(a => a.teamId === teamId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  getByUser: (userId: string, limit: number = 50): Activity[] => {
    const allActivities = readData<Activity>(ACTIVITIES_FILE);
    return allActivities
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  create: (data: {
    type: ActivityType;
    description: string;
    metadata?: Record<string, unknown>;
    userId: string;
    teamId?: string | null;
  }): Activity => {
    const allActivities = readData<Activity>(ACTIVITIES_FILE);
    const newActivity: Activity = {
      id: uuidv4(),
      type: data.type,
      description: data.description,
      metadata: data.metadata,
      userId: data.userId,
      teamId: data.teamId,
      createdAt: new Date(),
    };
    allActivities.push(newActivity);
    writeData(ACTIVITIES_FILE, allActivities);
    return newActivity;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const notifications = {
  getByUser: (userId: string): Notification[] => {
    const allNotifications = readData<Notification>(NOTIFICATIONS_FILE);
    return allNotifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUnreadCount: (userId: string): number => {
    const allNotifications = readData<Notification>(NOTIFICATIONS_FILE);
    return allNotifications.filter(n => n.userId === userId && !n.read).length;
  },

  create: (data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification => {
    const allNotifications = readData<Notification>(NOTIFICATIONS_FILE);
    const newNotification: Notification = {
      ...data,
      id: uuidv4(),
      read: false,
      createdAt: new Date(),
    };
    allNotifications.push(newNotification);
    writeData(NOTIFICATIONS_FILE, allNotifications);
    return newNotification;
  },

  markAsRead: (id: string): boolean => {
    const allNotifications = readData<Notification>(NOTIFICATIONS_FILE);
    const index = allNotifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    allNotifications[index].read = true;
    writeData(NOTIFICATIONS_FILE, allNotifications);
    return true;
  },

  markAllAsRead: (userId: string): void => {
    const allNotifications = readData<Notification>(NOTIFICATIONS_FILE);
    allNotifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    writeData(NOTIFICATIONS_FILE, allNotifications);
  },

  delete: (id: string): boolean => {
    const allNotifications = readData<Notification>(NOTIFICATIONS_FILE);
    const filtered = allNotifications.filter(n => n.id !== id);
    if (filtered.length === allNotifications.length) return false;
    writeData(NOTIFICATIONS_FILE, filtered);
    return true;
  },

  deleteAllForUser: (userId: string): void => {
    const allNotifications = readData<Notification>(NOTIFICATIONS_FILE);
    const filtered = allNotifications.filter(n => n.userId !== userId);
    writeData(NOTIFICATIONS_FILE, filtered);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE CONFIG OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

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
      id: uuidv4(),
      name: data.name,
      columns: data.columns,
      teamId: data.teamId,
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

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function initializeDefaultTableConfig(teamId: string): TableConfig {
  const existing = tableConfigs.getDefaultByTeam(teamId);
  if (existing) return existing;

  const defaultColumns: TableColumn[] = [
    { id: uuidv4(), name: 'Nome Ticket', type: 'text', required: true, visible: true },
    { id: uuidv4(), name: 'Descrizione', type: 'text', required: false, visible: true },
    { id: uuidv4(), name: 'Stato', type: 'select', options: ['Aperto', 'In Corso', 'Risolto', 'Chiuso'], required: true, visible: true },
    { id: uuidv4(), name: 'Priorità', type: 'select', options: ['Bassa', 'Media', 'Alta', 'Critica'], required: true, visible: true },
    { id: uuidv4(), name: 'Categoria', type: 'select', options: ['Bug', 'Feature', 'Support', 'Altro'], required: false, visible: true },
    { id: uuidv4(), name: 'Assegnato a', type: 'user', required: false, visible: true },
    { id: uuidv4(), name: 'Scadenza', type: 'date', required: false, visible: true },
    { id: uuidv4(), name: 'Tempo di Reazione (min)', type: 'number', required: false, visible: false },
    { id: uuidv4(), name: 'Tempo di Risoluzione (min)', type: 'number', required: false, visible: false },
    { id: uuidv4(), name: 'Data Creazione', type: 'date', required: true, visible: true },
  ];

  return tableConfigs.create({
    name: 'Configurazione Default',
    columns: defaultColumns,
    teamId,
    isDefault: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────

export function getDashboardStats(userId: string, teamId?: string | null) {
  const userNotes = notes.getByAuthor(userId);
  const privateNotes = userNotes.filter(n => n.isPrivate);
  const sharedNotes = teamId ? notes.getSharedByTeam(teamId) : [];

  const teamTickets = teamId ? tickets.getByTeam(teamId) : [];
  const overdueTickets = teamId ? tickets.getOverdue(teamId) : [];
  const upcomingDeadlines = teamId ? tickets.getUpcoming(teamId, 7).length : 0;

  const recentActivity = teamId ? activityLog.getByTeam(teamId, 10) : activityLog.getByUser(userId, 10);
  const teamMembers = teamId ? users.getByTeam(teamId).length : 0;

  return {
    totalNotes: privateNotes.length + sharedNotes.length,
    privateNotes: privateNotes.length,
    sharedNotes: sharedNotes.length,
    totalTickets: teamTickets.length,
    openTickets: teamTickets.filter(t => t.status === 'open').length,
    inProgressTickets: teamTickets.filter(t => t.status === 'in_progress').length,
    resolvedTickets: teamTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    overdueTickets: overdueTickets.length,
    upcomingDeadlines,
    recentActivity,
    teamMembers,
  };
}
