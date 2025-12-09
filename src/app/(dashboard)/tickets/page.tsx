'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, formatDistanceToNow, isPast, addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import Link from 'next/link';
import type { Ticket, TicketStatus, TicketPriority, User } from '@/types';

type TicketWithRelations = Ticket & {
  author?: { id: string; name: string; avatar: string | null };
  assignee?: { id: string; name: string; avatar: string | null } | null;
};

const statusOptions: { value: TicketStatus; label: string; color: string; bg: string }[] = [
  { value: 'open', label: 'Aperto', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { value: 'in_progress', label: 'In Corso', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { value: 'resolved', label: 'Risolto', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { value: 'closed', label: 'Chiuso', color: 'text-zinc-400', bg: 'bg-zinc-500/20' },
];

const priorityOptions: { value: TicketPriority; label: string; color: string; bg: string }[] = [
  { value: 'low', label: 'Bassa', color: 'text-zinc-400', bg: 'bg-zinc-500/20' },
  { value: 'medium', label: 'Media', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { value: 'high', label: 'Alta', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { value: 'critical', label: 'Critica', color: 'text-red-400', bg: 'bg-red-500/20' },
];

const categoryOptions = ['Bug', 'Feature', 'Support', 'Altro'];

export default function TicketsPage() {
  const session = { user: { id: 'admin-patrick', name: 'Patrick', email: 'patrickanthonystudio@gmail.com', teamId: 'team-default', role: 'admin' } };
  const [tickets, setTickets] = useState<TicketWithRelations[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'dueDate'>('date');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium' as TicketPriority,
    category: '',
    assigneeId: '',
    dueDate: '',
    tags: '',
  });

  // Detail view
  const [selectedTicket, setSelectedTicket] = useState<TicketWithRelations | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const hasTeam = Boolean(session?.user?.teamId);

  useEffect(() => {
    if (hasTeam) {
      fetchTickets();
      fetchTeamMembers();
    } else {
      setIsLoading(false);
    }
  }, [hasTeam]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (Array.isArray(data)) setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/teams');
      const data = await res.json();
      if (data?.members) setTeamMembers(data.members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          priority: formData.priority,
          category: formData.category || null,
          assigneeId: formData.assigneeId || null,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        await fetchTickets();
        resetForm();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!editingTicket || !formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${editingTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          priority: formData.priority,
          category: formData.category || null,
          assigneeId: formData.assigneeId || null,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        await fetchTickets();
        resetForm();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('Eliminare questo ticket?')) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTickets(tickets.filter(t => t.id !== id));
        if (selectedTicket?.id === id) {
          setIsDetailOpen(false);
          setSelectedTicket(null);
        }
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const openEditModal = (ticket: TicketWithRelations) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      description: ticket.description || '',
      priority: ticket.priority,
      category: ticket.category || '',
      assigneeId: ticket.assigneeId || '',
      dueDate: ticket.dueDate ? format(new Date(ticket.dueDate), 'yyyy-MM-dd') : '',
      tags: (ticket.tags || []).join(', '),
    });
    setIsModalOpen(true);
  };

  const openDetailView = (ticket: TicketWithRelations) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  const resetForm = () => {
    setEditingTicket(null);
    setFormData({
      name: '',
      description: '',
      priority: 'medium',
      category: '',
      assigneeId: '',
      dueDate: '',
      tags: '',
    });
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
      overdue: tickets.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'resolved' && t.status !== 'closed').length,
      critical: tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length,
    };
  }, [tickets]);

  // Filtered and sorted tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        (t.description || '').toLowerCase().includes(query) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        result = result.filter(t => !t.assigneeId);
      } else {
        result = result.filter(t => t.assigneeId === assigneeFilter);
      }
    }

    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [tickets, searchQuery, statusFilter, priorityFilter, assigneeFilter, sortBy]);

  if (!hasTeam) {
    return (
      <div className="page">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Gestione Ticket</h1>
          <p className="text-sm text-zinc-500">Sistema di gestione delle richieste del team</p>
        </div>
        <div className="card">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white mb-2">Unisciti a un team</p>
            <p className="text-sm text-zinc-500 mb-8">Per accedere ai ticket devi far parte di un team</p>
            <Link href="/team" className="btn btn-primary">
              Vai alla gestione Team
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Gestione Ticket</h1>
          <p className="text-sm text-zinc-500">Sistema completo di gestione delle richieste</p>
        </div>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="btn btn-primary shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuovo Ticket
        </button>
      </div>

      {/* Stats Cards - Horizontal Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 mb-10">
        <div className="card p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Totali</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="card p-5 border-blue-500/20">
          <p className="text-xs text-blue-400 uppercase tracking-wider mb-2">Aperti</p>
          <p className="text-2xl font-bold text-blue-400">{stats.open}</p>
        </div>
        <div className="card p-5 border-amber-500/20">
          <p className="text-xs text-amber-400 uppercase tracking-wider mb-2">In Corso</p>
          <p className="text-2xl font-bold text-amber-400">{stats.inProgress}</p>
        </div>
        <div className="card p-5 border-emerald-500/20">
          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Risolti</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
        </div>
        <div className="card p-5 border-red-500/20">
          <p className="text-xs text-red-400 uppercase tracking-wider mb-2">Critici</p>
          <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
        </div>
        <div className="card p-5 border-red-500/20">
          <p className="text-xs text-red-400 uppercase tracking-wider mb-2">In Ritardo</p>
          <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-10">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cerca ticket per nome, descrizione o tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12 w-full"
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Status Filter */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2 font-medium">Stato</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
              className="input w-full"
            >
              <option value="all">Tutti gli stati</option>
              {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2 font-medium">Priorità</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'all')}
              className="input w-full"
            >
              <option value="all">Tutte le priorità</option>
              {priorityOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2 font-medium">Assegnato a</label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="input w-full"
            >
              <option value="all">Tutti</option>
              <option value="unassigned">Non assegnati</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2 font-medium">Ordina per</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'dueDate')}
              className="input w-full"
            >
              <option value="date">Data creazione</option>
              <option value="priority">Priorità</option>
              <option value="dueDate">Scadenza</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center gap-4">
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-1/3" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
                <div className="skeleton h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="card">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white mb-2">{searchQuery ? 'Nessun risultato trovato' : 'Nessun ticket presente'}</p>
            <p className="text-sm text-zinc-500 mb-8">{searchQuery ? 'Prova a modificare i filtri' : 'Crea il tuo primo ticket per iniziare'}</p>
            {!searchQuery && (
              <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="btn btn-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crea il primo ticket
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const status = statusOptions.find(s => s.value === ticket.status)!;
            const priority = priorityOptions.find(p => p.value === ticket.priority)!;
            const isOverdue = ticket.dueDate && isPast(new Date(ticket.dueDate)) && ticket.status !== 'resolved' && ticket.status !== 'closed';
            const isDueSoon = ticket.dueDate && !isOverdue && new Date(ticket.dueDate) <= addDays(new Date(), 2);

            return (
              <div
                key={ticket.id}
                onClick={() => openDetailView(ticket)}
                className={`card p-5 cursor-pointer transition-all hover:scale-[1.01] hover:border-white/20 ${isOverdue ? 'border-red-500/30 bg-red-950/10' : ''}`}
              >
                <div className="flex items-start gap-5">
                  {/* Priority Indicator */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${priority.bg} ${priority.color}`}>
                    {ticket.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-white mb-1">{ticket.name}</h3>
                        {ticket.description && (
                          <p className="text-sm text-zinc-500 line-clamp-1">{ticket.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${priority.bg} ${priority.color}`}>
                          {priority.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      {/* Assignee */}
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="avatar w-6 h-6 rounded text-[10px]">{ticket.assignee.name.charAt(0).toUpperCase()}</div>
                          <span className="text-zinc-400">{ticket.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600">Non assegnato</span>
                      )}

                      {/* Category */}
                      {ticket.category && (
                        <span className="text-zinc-500">{ticket.category}</span>
                      )}

                      {/* Due Date */}
                      {ticket.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400 font-medium' : isDueSoon ? 'text-amber-400' : 'text-zinc-500'}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(ticket.dueDate), 'd MMM', { locale: it })}
                        </span>
                      )}

                      {/* Created */}
                      <span className="text-zinc-600 ml-auto">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: it })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditModal(ticket)}
                      className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTicket ? 'Modifica Ticket' : 'Nuovo Ticket'}</h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body space-y-6">
              {/* Name */}
              <div>
                <label className="label">Nome Ticket *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Titolo del ticket..."
                  className="input"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="label">Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrivi il problema in dettaglio..."
                  className="input min-h-[120px]"
                  rows={4}
                />
              </div>

              {/* Priority and Category */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label">Priorità</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                    className="input"
                  >
                    {priorityOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleziona categoria...</option>
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Assignee and Due Date */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label">Assegna a</label>
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                    className="input"
                  >
                    <option value="">Non assegnato</option>
                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Scadenza</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input"
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="label">Tags (separati da virgola)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="urgente, frontend, api..."
                  className="input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="btn btn-ghost">
                Annulla
              </button>
              <button
                onClick={editingTicket ? handleUpdateTicket : handleCreateTicket}
                disabled={!formData.name.trim() || isSubmitting}
                className="btn btn-primary disabled:opacity-40"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Salvataggio...
                  </span>
                ) : (
                  editingTicket ? 'Salva modifiche' : 'Crea Ticket'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {isDetailOpen && selectedTicket && (
        <div className="modal-overlay" onClick={() => setIsDetailOpen(false)}>
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-zinc-900 border-l border-white/[0.06] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10 p-6 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Dettagli Ticket</h2>
                <button onClick={() => setIsDetailOpen(false)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusOptions.find(s => s.value === selectedTicket.status)?.bg} ${statusOptions.find(s => s.value === selectedTicket.status)?.color}`}>
                  {statusOptions.find(s => s.value === selectedTicket.status)?.label}
                </span>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${priorityOptions.find(p => p.value === selectedTicket.priority)?.bg} ${priorityOptions.find(p => p.value === selectedTicket.priority)?.color}`}>
                  {priorityOptions.find(p => p.value === selectedTicket.priority)?.label}
                </span>
                {selectedTicket.category && (
                  <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300">{selectedTicket.category}</span>
                )}
              </div>

              {/* Title and Description */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">{selectedTicket.name}</h3>
                {selectedTicket.description && (
                  <p className="text-zinc-400 text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                )}
              </div>

              {/* People */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Creato da</p>
                  {selectedTicket.author && (
                    <div className="flex items-center gap-3">
                      <div className="avatar w-10 h-10 rounded-xl text-sm">{selectedTicket.author.name.charAt(0).toUpperCase()}</div>
                      <span className="text-sm text-white font-medium">{selectedTicket.author.name}</span>
                    </div>
                  )}
                </div>
                <div className="card p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Assegnato a</p>
                  {selectedTicket.assignee ? (
                    <div className="flex items-center gap-3">
                      <div className="avatar w-10 h-10 rounded-xl text-sm">{selectedTicket.assignee.name.charAt(0).toUpperCase()}</div>
                      <span className="text-sm text-white font-medium">{selectedTicket.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-500">Non assegnato</span>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Creato</span>
                  <span className="text-sm text-zinc-300">{format(new Date(selectedTicket.createdAt), 'd MMMM yyyy, HH:mm', { locale: it })}</span>
                </div>
                {selectedTicket.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Scadenza</span>
                    <span className={`text-sm ${isPast(new Date(selectedTicket.dueDate)) && selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' ? 'text-red-400 font-medium' : 'text-zinc-300'}`}>
                      {format(new Date(selectedTicket.dueDate), 'd MMMM yyyy', { locale: it })}
                    </span>
                  </div>
                )}
                {selectedTicket.closedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Chiuso</span>
                    <span className="text-sm text-emerald-400">{format(new Date(selectedTicket.closedAt), 'd MMMM yyyy, HH:mm', { locale: it })}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTicket.tags.map(tag => (
                      <span key={tag} className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1.5 rounded-lg">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Change Status */}
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Cambia Stato</p>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(s => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(selectedTicket.id, s.value)}
                      className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                        selectedTicket.status === s.value
                          ? `${s.bg} ${s.color} ring-2 ring-offset-2 ring-offset-zinc-900`
                          : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                      }`}
                      style={{ ['--tw-ring-color' as string]: s.value === 'open' ? '#3b82f6' : s.value === 'in_progress' ? '#f59e0b' : s.value === 'resolved' ? '#10b981' : '#71717a' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => { setIsDetailOpen(false); openEditModal(selectedTicket); }}
                  className="btn btn-secondary flex-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifica
                </button>
                <button
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                  className="btn bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
