// ═══════════════════════════════════════════════════════════════════════════
// ALLOS WORKFIELD - TYPE DEFINITIONS
// Complete type system for the application
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// USER TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  bio?: string | null;
  role: 'admin' | 'member';
  teamId?: string | null;
  preferences?: UserPreferences;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  language: 'it' | 'en';
  compactView: boolean;
}

export interface UserWithPassword extends User {
  password: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEAM TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  inviteCode: string;
  color?: string;
  logo?: string | null;
  settings?: TeamSettings;
  createdAt: Date;
  updatedAt: Date;
  members?: User[];
}

export interface TeamSettings {
  allowMemberInvites: boolean;
  requireApproval: boolean;
  defaultTicketPriority: 'low' | 'medium' | 'high';
  ticketCategories: string[];
}

export interface TeamStats {
  totalMembers: number;
  totalNotes: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type NoteColor = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';
export type NoteCategory = string;

export interface Note {
  id: string;
  title?: string | null;
  content: string;
  isPrivate: boolean;
  isPinned: boolean;
  color: NoteColor;
  category?: NoteCategory | null;
  tags: string[];
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  teamId?: string | null;
  author?: User;
}

// ─────────────────────────────────────────────────────────────────────────────
// TICKET TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = string;

export interface Ticket {
  id: string;
  name: string;
  description?: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category?: TicketCategory | null;
  tags: string[];
  dueDate?: Date | null;
  reactionTime?: number | null;
  resolutionTime?: number | null;
  customFields?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date | null;
  authorId: string;
  assigneeId?: string | null;
  teamId: string;
  author?: User;
  assignee?: User | null;
  comments?: TicketComment[];
  activities?: TicketActivity[];
}

export interface TicketComment {
  id: string;
  content: string;
  ticketId: string;
  authorId: string;
  author?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketActivity {
  id: string;
  type: 'created' | 'status_change' | 'priority_change' | 'assigned' | 'comment' | 'updated' | 'closed';
  description: string;
  oldValue?: string;
  newValue?: string;
  ticketId: string;
  userId: string;
  user?: User;
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR & EVENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type EventType = 'deadline' | 'meeting' | 'reminder' | 'milestone' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  type: EventType;
  startDate: Date;
  endDate?: Date | null;
  allDay: boolean;
  color?: string;
  relatedTicketId?: string | null;
  authorId: string;
  teamId?: string | null;
  author?: User;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY LOG TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ActivityType =
  | 'note_created'
  | 'note_updated'
  | 'note_deleted'
  | 'ticket_created'
  | 'ticket_updated'
  | 'ticket_closed'
  | 'ticket_comment'
  | 'member_joined'
  | 'member_left'
  | 'team_updated'
  | 'event_created';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  userId: string;
  teamId?: string | null;
  user?: User;
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE CONFIG TYPES (for custom ticket tables)
// ─────────────────────────────────────────────────────────────────────────────

export interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'user';
  options?: string[];
  required: boolean;
  width?: number;
  visible: boolean;
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

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'ticket_assigned'
  | 'ticket_updated'
  | 'ticket_comment'
  | 'note_shared'
  | 'team_invite'
  | 'deadline_reminder'
  | 'mention';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  userId: string;
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION TYPES
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalNotes: number;
  privateNotes: number;
  sharedNotes: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  overdueTickets: number;
  upcomingDeadlines: number;
  recentActivity: Activity[];
  teamMembers: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER & SORT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface NoteFilters {
  search?: string;
  category?: string;
  color?: NoteColor;
  tags?: string[];
  isPinned?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface TicketFilters {
  search?: string;
  status?: TicketStatus[];
  priority?: TicketPriority[];
  category?: string;
  assigneeId?: string;
  authorId?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  overdue?: boolean;
}

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}
