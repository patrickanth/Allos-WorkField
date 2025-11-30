export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: string;
  teamId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
  members?: User[];
}

export interface Note {
  id: string;
  content: string;
  isPrivate: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  teamId?: string | null;
  author?: User;
}

export interface Ticket {
  id: string;
  name: string;
  description?: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reactionTime?: number | null;
  resolutionTime?: number | null;
  customFields?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  assigneeId?: string | null;
  teamId: string;
  author?: User;
  assignee?: User | null;
}

export interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[];
  required: boolean;
  width?: number;
}

export interface TableConfig {
  id: string;
  name: string;
  columns: TableColumn[];
  isDefault: boolean;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: string;
  teamId?: string | null;
  teamName?: string | null;
  teamSlug?: string | null;
}
