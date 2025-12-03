import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import type { User, Team, Note, Ticket, Client, VisualBoard, TableConfig } from '@/types';

// Initialize Firebase Admin
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

const db = getFirestore();

// Helper to convert Firestore timestamp to Date
function timestampToDate(timestamp: any): Date {
  if (timestamp instanceof Date) return timestamp;
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp?.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
}

// Helper to convert data from Firestore
function convertFirestoreData<T>(data: any): T {
  const converted: any = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key]?.toDate) {
      converted[key] = converted[key].toDate();
    } else if (converted[key]?.seconds) {
      converted[key] = new Date(converted[key].seconds * 1000);
    }
  });
  return converted as T;
}

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  TEAMS: 'teams',
  CLIENTS: 'clients',
  NOTES: 'notes',
  TICKETS: 'tickets',
  VISUAL_BOARDS: 'visualBoards',
  TABLE_CONFIGS: 'tableConfigs',
};

// ==================== USER OPERATIONS ====================

export const users = {
  getAll: async (): Promise<User[]> => {
    const snapshot = await db.collection(COLLECTIONS.USERS).get();
    return snapshot.docs.map(doc => convertFirestoreData<User>({ id: doc.id, ...doc.data() }));
  },

  getById: async (id: string): Promise<User | undefined> => {
    const doc = await db.collection(COLLECTIONS.USERS).doc(id).get();
    if (!doc.exists) return undefined;
    return convertFirestoreData<User>({ id: doc.id, ...doc.data() });
  },

  getByEmail: async (email: string): Promise<User | undefined> => {
    const snapshot = await db.collection(COLLECTIONS.USERS).where('email', '==', email).limit(1).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return convertFirestoreData<User>({ id: doc.id, ...doc.data() });
  },

  getByTeam: async (teamId: string): Promise<User[]> => {
    const snapshot = await db.collection(COLLECTIONS.USERS).where('teamId', '==', teamId).get();
    return snapshot.docs.map(doc => convertFirestoreData<User>({ id: doc.id, ...doc.data() }));
  },

  create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const now = new Date();
    const docRef = await db.collection(COLLECTIONS.USERS).add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    const doc = await docRef.get();
    return convertFirestoreData<User>({ id: doc.id, ...doc.data() });
  },

  update: async (id: string, data: Partial<User>): Promise<User | undefined> => {
    const docRef = db.collection(COLLECTIONS.USERS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;

    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });

    const updated = await docRef.get();
    return convertFirestoreData<User>({ id: updated.id, ...updated.data() });
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.collection(COLLECTIONS.USERS).doc(id).delete();
      return true;
    } catch {
      return false;
    }
  },
};

// ==================== TEAM OPERATIONS ====================

export const teams = {
  getAll: async (): Promise<Team[]> => {
    const snapshot = await db.collection(COLLECTIONS.TEAMS).get();
    return snapshot.docs.map(doc => convertFirestoreData<Team>({ id: doc.id, ...doc.data() }));
  },

  getById: async (id: string): Promise<Team | undefined> => {
    const doc = await db.collection(COLLECTIONS.TEAMS).doc(id).get();
    if (!doc.exists) return undefined;
    return convertFirestoreData<Team>({ id: doc.id, ...doc.data() });
  },

  getBySlug: async (slug: string): Promise<Team | undefined> => {
    const snapshot = await db.collection(COLLECTIONS.TEAMS).where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return convertFirestoreData<Team>({ id: doc.id, ...doc.data() });
  },

  getByInviteCode: async (code: string): Promise<Team | undefined> => {
    const snapshot = await db.collection(COLLECTIONS.TEAMS).where('inviteCode', '==', code).limit(1).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return convertFirestoreData<Team>({ id: doc.id, ...doc.data() });
  },

  create: async (data: Omit<Team, 'id' | 'inviteCode' | 'createdAt' | 'updatedAt'>): Promise<Team> => {
    const now = new Date();
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const docRef = await db.collection(COLLECTIONS.TEAMS).add({
      ...data,
      inviteCode,
      createdAt: now,
      updatedAt: now,
    });
    const doc = await docRef.get();
    return convertFirestoreData<Team>({ id: doc.id, ...doc.data() });
  },

  update: async (id: string, data: Partial<Team>): Promise<Team | undefined> => {
    const docRef = db.collection(COLLECTIONS.TEAMS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;

    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });

    const updated = await docRef.get();
    return convertFirestoreData<Team>({ id: updated.id, ...updated.data() });
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.collection(COLLECTIONS.TEAMS).doc(id).delete();
      return true;
    } catch {
      return false;
    }
  },

  regenerateInviteCode: async (id: string): Promise<Team | undefined> => {
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    return teams.update(id, { inviteCode });
  },
};

// ==================== CLIENT OPERATIONS ====================

export const clients = {
  getAll: async (): Promise<Client[]> => {
    const snapshot = await db.collection(COLLECTIONS.CLIENTS).get();
    return snapshot.docs.map(doc => convertFirestoreData<Client>({ id: doc.id, ...doc.data() }));
  },

  getById: async (id: string): Promise<Client | undefined> => {
    const doc = await db.collection(COLLECTIONS.CLIENTS).doc(id).get();
    if (!doc.exists) return undefined;
    return convertFirestoreData<Client>({ id: doc.id, ...doc.data() });
  },

  getByTeam: async (teamId: string): Promise<Client[]> => {
    const snapshot = await db.collection(COLLECTIONS.CLIENTS).where('teamId', '==', teamId).get();
    return snapshot.docs.map(doc => convertFirestoreData<Client>({ id: doc.id, ...doc.data() }));
  },

  create: async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const now = new Date();
    const docRef = await db.collection(COLLECTIONS.CLIENTS).add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    const doc = await docRef.get();
    return convertFirestoreData<Client>({ id: doc.id, ...doc.data() });
  },

  update: async (id: string, data: Partial<Client>): Promise<Client | undefined> => {
    const docRef = db.collection(COLLECTIONS.CLIENTS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;

    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });

    const updated = await docRef.get();
    return convertFirestoreData<Client>({ id: updated.id, ...updated.data() });
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.collection(COLLECTIONS.CLIENTS).doc(id).delete();
      return true;
    } catch {
      return false;
    }
  },
};

// ==================== NOTE OPERATIONS ====================

export const notes = {
  getAll: async (): Promise<Note[]> => {
    const snapshot = await db.collection(COLLECTIONS.NOTES).get();
    return snapshot.docs.map(doc => convertFirestoreData<Note>({ id: doc.id, ...doc.data() }));
  },

  getById: async (id: string): Promise<Note | undefined> => {
    const doc = await db.collection(COLLECTIONS.NOTES).doc(id).get();
    if (!doc.exists) return undefined;
    return convertFirestoreData<Note>({ id: doc.id, ...doc.data() });
  },

  getByAuthor: async (authorId: string): Promise<Note[]> => {
    const snapshot = await db.collection(COLLECTIONS.NOTES).where('authorId', '==', authorId).get();
    return snapshot.docs.map(doc => convertFirestoreData<Note>({ id: doc.id, ...doc.data() }));
  },

  getByTeam: async (teamId: string): Promise<Note[]> => {
    const snapshot = await db.collection(COLLECTIONS.NOTES)
      .where('teamId', '==', teamId)
      .where('isPrivate', '==', false)
      .get();
    return snapshot.docs.map(doc => convertFirestoreData<Note>({ id: doc.id, ...doc.data() }));
  },

  getByClient: async (clientId: string): Promise<Note[]> => {
    const snapshot = await db.collection(COLLECTIONS.NOTES).where('clientId', '==', clientId).get();
    return snapshot.docs.map(doc => convertFirestoreData<Note>({ id: doc.id, ...doc.data() }));
  },

  getPrivateByAuthor: async (authorId: string): Promise<Note[]> => {
    const snapshot = await db.collection(COLLECTIONS.NOTES)
      .where('authorId', '==', authorId)
      .where('isPrivate', '==', true)
      .get();
    return snapshot.docs.map(doc => convertFirestoreData<Note>({ id: doc.id, ...doc.data() }));
  },

  create: async (data: Omit<Note, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    const now = new Date();
    const docRef = await db.collection(COLLECTIONS.NOTES).add({
      ...data,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    });
    const doc = await docRef.get();
    return convertFirestoreData<Note>({ id: doc.id, ...doc.data() });
  },

  update: async (id: string, data: Partial<Note>): Promise<Note | undefined> => {
    const docRef = db.collection(COLLECTIONS.NOTES).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;

    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });

    const updated = await docRef.get();
    return convertFirestoreData<Note>({ id: updated.id, ...updated.data() });
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.collection(COLLECTIONS.NOTES).doc(id).delete();
      return true;
    } catch {
      return false;
    }
  },

  togglePrivacy: async (id: string): Promise<Note | undefined> => {
    const note = await notes.getById(id);
    if (!note) return undefined;
    return notes.update(id, { isPrivate: !note.isPrivate });
  },
};

// ==================== TICKET OPERATIONS ====================

export const tickets = {
  getAll: async (): Promise<Ticket[]> => {
    const snapshot = await db.collection(COLLECTIONS.TICKETS).get();
    return snapshot.docs.map(doc => convertFirestoreData<Ticket>({ id: doc.id, ...doc.data() }));
  },

  getById: async (id: string): Promise<Ticket | undefined> => {
    const doc = await db.collection(COLLECTIONS.TICKETS).doc(id).get();
    if (!doc.exists) return undefined;
    return convertFirestoreData<Ticket>({ id: doc.id, ...doc.data() });
  },

  getByTeam: async (teamId: string): Promise<Ticket[]> => {
    const snapshot = await db.collection(COLLECTIONS.TICKETS).where('teamId', '==', teamId).get();
    return snapshot.docs.map(doc => convertFirestoreData<Ticket>({ id: doc.id, ...doc.data() }));
  },

  getByAuthor: async (authorId: string): Promise<Ticket[]> => {
    const snapshot = await db.collection(COLLECTIONS.TICKETS).where('authorId', '==', authorId).get();
    return snapshot.docs.map(doc => convertFirestoreData<Ticket>({ id: doc.id, ...doc.data() }));
  },

  getByAssignee: async (assigneeId: string): Promise<Ticket[]> => {
    const snapshot = await db.collection(COLLECTIONS.TICKETS).where('assigneeId', '==', assigneeId).get();
    return snapshot.docs.map(doc => convertFirestoreData<Ticket>({ id: doc.id, ...doc.data() }));
  },

  getByClient: async (clientId: string): Promise<Ticket[]> => {
    const snapshot = await db.collection(COLLECTIONS.TICKETS).where('clientId', '==', clientId).get();
    return snapshot.docs.map(doc => convertFirestoreData<Ticket>({ id: doc.id, ...doc.data() }));
  },

  create: async (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> => {
    const now = new Date();
    const docRef = await db.collection(COLLECTIONS.TICKETS).add({
      ...data,
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
    });
    const doc = await docRef.get();
    return convertFirestoreData<Ticket>({ id: doc.id, ...doc.data() });
  },

  update: async (id: string, data: Partial<Ticket>): Promise<Ticket | undefined> => {
    const docRef = db.collection(COLLECTIONS.TICKETS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;

    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });

    const updated = await docRef.get();
    return convertFirestoreData<Ticket>({ id: updated.id, ...updated.data() });
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.collection(COLLECTIONS.TICKETS).doc(id).delete();
      return true;
    } catch {
      return false;
    }
  },
};

// ==================== VISUAL BOARD OPERATIONS ====================

export const visualBoards = {
  getAll: async (): Promise<VisualBoard[]> => {
    const snapshot = await db.collection(COLLECTIONS.VISUAL_BOARDS).get();
    return snapshot.docs.map(doc => convertFirestoreData<VisualBoard>({ id: doc.id, ...doc.data() }));
  },

  getById: async (id: string): Promise<VisualBoard | undefined> => {
    const doc = await db.collection(COLLECTIONS.VISUAL_BOARDS).doc(id).get();
    if (!doc.exists) return undefined;
    return convertFirestoreData<VisualBoard>({ id: doc.id, ...doc.data() });
  },

  getByTeam: async (teamId: string): Promise<VisualBoard[]> => {
    const snapshot = await db.collection(COLLECTIONS.VISUAL_BOARDS).where('teamId', '==', teamId).get();
    return snapshot.docs.map(doc => convertFirestoreData<VisualBoard>({ id: doc.id, ...doc.data() }));
  },

  getByAuthor: async (authorId: string): Promise<VisualBoard[]> => {
    const snapshot = await db.collection(COLLECTIONS.VISUAL_BOARDS).where('authorId', '==', authorId).get();
    return snapshot.docs.map(doc => convertFirestoreData<VisualBoard>({ id: doc.id, ...doc.data() }));
  },

  create: async (data: Omit<VisualBoard, 'id' | 'createdAt' | 'updatedAt'>): Promise<VisualBoard> => {
    const now = new Date();
    const docRef = await db.collection(COLLECTIONS.VISUAL_BOARDS).add({
      ...data,
      nodes: data.nodes || [],
      edges: data.edges || [],
      createdAt: now,
      updatedAt: now,
    });
    const doc = await docRef.get();
    return convertFirestoreData<VisualBoard>({ id: doc.id, ...doc.data() });
  },

  update: async (id: string, data: Partial<VisualBoard>): Promise<VisualBoard | undefined> => {
    const docRef = db.collection(COLLECTIONS.VISUAL_BOARDS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;

    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });

    const updated = await docRef.get();
    return convertFirestoreData<VisualBoard>({ id: updated.id, ...updated.data() });
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.collection(COLLECTIONS.VISUAL_BOARDS).doc(id).delete();
      return true;
    } catch {
      return false;
    }
  },
};

// ==================== TABLE CONFIG OPERATIONS ====================

export const tableConfigs = {
  getAll: async (): Promise<TableConfig[]> => {
    const snapshot = await db.collection(COLLECTIONS.TABLE_CONFIGS).get();
    return snapshot.docs.map(doc => convertFirestoreData<TableConfig>({ id: doc.id, ...doc.data() }));
  },

  getById: async (id: string): Promise<TableConfig | undefined> => {
    const doc = await db.collection(COLLECTIONS.TABLE_CONFIGS).doc(id).get();
    if (!doc.exists) return undefined;
    return convertFirestoreData<TableConfig>({ id: doc.id, ...doc.data() });
  },

  getByTeam: async (teamId: string): Promise<TableConfig[]> => {
    const snapshot = await db.collection(COLLECTIONS.TABLE_CONFIGS).where('teamId', '==', teamId).get();
    return snapshot.docs.map(doc => convertFirestoreData<TableConfig>({ id: doc.id, ...doc.data() }));
  },

  getDefaultByTeam: async (teamId: string): Promise<TableConfig | undefined> => {
    const snapshot = await db.collection(COLLECTIONS.TABLE_CONFIGS)
      .where('teamId', '==', teamId)
      .where('isDefault', '==', true)
      .limit(1)
      .get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return convertFirestoreData<TableConfig>({ id: doc.id, ...doc.data() });
  },

  create: async (data: Omit<TableConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<TableConfig> => {
    const now = new Date();
    const docRef = await db.collection(COLLECTIONS.TABLE_CONFIGS).add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    const doc = await docRef.get();
    return convertFirestoreData<TableConfig>({ id: doc.id, ...doc.data() });
  },

  update: async (id: string, data: Partial<TableConfig>): Promise<TableConfig | undefined> => {
    const docRef = db.collection(COLLECTIONS.TABLE_CONFIGS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;

    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });

    const updated = await docRef.get();
    return convertFirestoreData<TableConfig>({ id: updated.id, ...updated.data() });
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.collection(COLLECTIONS.TABLE_CONFIGS).doc(id).delete();
      return true;
    } catch {
      return false;
    }
  },
};

export { db };
