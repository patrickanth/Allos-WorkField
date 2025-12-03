export interface User {
  id: string;
  email: string;
  password?: string; // Only used internally, never exposed to client
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

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
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
  clientId?: string | null;
  author?: User;
  client?: Client;
}

export interface Ticket {
  id: string;
  name: string;
  description?: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string | null;
  tags?: string[];
  dueDate?: Date | null;
  reactionTime?: number | null;
  resolutionTime?: number | null;
  customFields?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  assigneeId?: string | null;
  clientId?: string | null;
  teamId: string;
  author?: User;
  assignee?: User | null;
  client?: Client;
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

export interface VisualBoardNode {
  id: string;
  type: 'client' | 'ticket' | 'note' | 'custom';
  label: string;
  data: {
    entityId?: string;
    color?: string;
    icon?: string;
    metadata?: Record<string, unknown>;
  };
  position: { x: number; y: number };
}

export interface VisualBoardEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'smooth' | 'step';
}

export interface VisualBoard {
  id: string;
  name: string;
  description?: string | null;
  nodes: VisualBoardNode[];
  edges: VisualBoardEdge[];
  teamId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
}
