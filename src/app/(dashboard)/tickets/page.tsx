'use client';

import { useState, useEffect, useMemo } from 'react';
// Session removed
import { format, formatDistanceToNow, isPast, addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import Link from 'next/link';
import type { Ticket, TicketStatus, TicketPriority, User } from '@/types';

type TicketWithRelations = Ticket & {
  author?: { id: string; name: string; avatar: string | null };
  assignee?: { id: string; name: string; avatar: string | null } | null;
};

const statusOptions: { value: TicketStatus; label: string; color: string }[] = [
  { value: 'open', label: 'Aperto', color: 'badge-blue' },
  { value: 'in_progress', label: 'In Corso', color: 'badge-amber' },
  { value: 'resolved', label: 'Risolto', color: 'badge-green' },
  { value: 'closed', label: 'Chiuso', color: 'badge-default' },
];

const priorityOptions: { value: TicketPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Bassa', color: 'badge-default' },
  { value: 'medium', label: 'Media', color: 'badge-blue' },
  { value: 'high', label: 'Alta', color: 'badge-amber' },
  { value: 'critical', label: 'Critica', color: 'badge-red' },
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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'dueDate'>('date');

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

  const handleExport = async (exportFormat: 'xlsx' | 'csv') => {
    try {
      const res = await fetch(`/api/tickets/export?format=${exportFormat}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
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

    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }

    if (showOverdueOnly) {
      result = result.filter(t =>
        t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'resolved' && t.status !== 'closed'
      );
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
  }, [tickets, searchQuery, statusFilter, priorityFilter, assigneeFilter, categoryFilter, showOverdueOnly, sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(tickets.map(t => t.category).filter(Boolean) as string[]);
    return Array.from(cats);
  }, [tickets]);

  if (!hasTeam) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Gestione Ticket</h1>
          <p className="page-subtitle">Sistema di gestione delle richieste del team</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="empty-title">Unisciti a un team</p>
            <p className="empty-text">Per accedere ai ticket devi far parte di un team</p>
            <Link href="/team" className="btn btn-glow mt-8">
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
      <div className="page-header flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Gestione Ticket</h1>
          <p className="page-subtitle">Sistema completo di gestione delle richieste</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="btn btn-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Esporta
            </button>
            <div className="dropdown hidden group-hover:block">
              <button onClick={() => handleExport('xlsx')} className="dropdown-item">Excel (.xlsx)</button>
              <button onClick={() => handleExport('csv')} className="dropdown-item">CSV (.csv)</button>
            </div>
          </div>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nuovo Ticket</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="stat-card">
          <p className="stat-label">Totali</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label text-blue-400">Aperti</p>
          <p className="stat-value text-blue-400">{stats.open}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label text-amber-400">In Corso</p>
          <p className="stat-value text-amber-400">{stats.inProgress}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label text-emerald-400">Risolti</p>
          <p className="stat-value text-emerald-400">{stats.resolved}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label text-red-400">Critici</p>
          <p className="stat-value text-red-400">{stats.critical}</p>
        </div>
        <button
          onClick={() => setShowOverdueOnly(!showOverdueOnly)}
          className={`stat-card cursor-pointer transition-all ${showOverdueOnly ? 'ring-2 ring-red-500' : ''} ${stats.overdue > 0 ? 'border-red-500/30' : ''}`}
        >
          <p className="stat-label text-red-400">In Ritardo</p>
          <p className="stat-value text-red-400">{stats.overdue}</p>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cerca nei ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-14"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')} className="input py-3 px-4 min-w-[120px]">
              <option value="all">Tutti gli stati</option>
              {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'all')} className="input py-3 px-4 min-w-[120px]">
              <option value="all">Tutte le priorita</option>
              {priorityOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>

            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="input py-3 px-4 min-w-[140px]">
              <option value="all">Tutti</option>
              <option value="unassigned">Non assegnati</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            {categories.length > 0 && (
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input py-3 px-4 min-w-[120px]">
                <option value="all">Categorie</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'dueDate')} className="input py-3 px-4 min-w-[130px]">
              <option value="date">Per data</option>
              <option value="priority">Per priorita</option>
              <option value="dueDate">Per scadenza</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      {isLoading ? (
        <div className="card p-0 overflow-hidden">
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="empty-title">{searchQuery ? 'Nessun risultato' : 'Nessun ticket'}</p>
            <p className="empty-text">{searchQuery ? 'Modifica i filtri' : 'Crea il primo ticket'}</p>
            {!searchQuery && (
              <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="btn btn-glow mt-8">
                Crea il primo ticket
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Stato</th>
                  <th>Priorita</th>
                  <th>Assegnato</th>
                  <th>Scadenza</th>
                  <th>Creato</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => {
                  const status = statusOptions.find(s => s.value === ticket.status)!;
                  const priority = priorityOptions.find(p => p.value === ticket.priority)!;
                  const isOverdue = ticket.dueDate && isPast(new Date(ticket.dueDate)) && ticket.status !== 'resolved' && ticket.status !== 'closed';
                  const isDueSoon = ticket.dueDate && !isOverdue && new Date(ticket.dueDate) <= addDays(new Date(), 2);

                  return (
                    <tr key={ticket.id} className={`cursor-pointer ${isOverdue ? 'bg-red-950/20' : ''}`} onClick={() => openDetailView(ticket)}>
                      <td>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium ${
                            ticket.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                            ticket.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {ticket.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate max-w-xs">{ticket.name}</p>
                            {ticket.category && <p className="text-xs text-zinc-500">{ticket.category}</p>}
                          </div>
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select value={ticket.status} onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)} className={`badge ${status.color} cursor-pointer border-0 pr-8 bg-transparent`}>
                          {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${priority.color}`}>{priority.label}</span>
                      </td>
                      <td>
                        {ticket.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="avatar w-7 h-7 rounded-lg text-[11px]">{ticket.assignee.name.charAt(0).toUpperCase()}</div>
                            <span className="text-sm text-zinc-400 truncate max-w-[100px]">{ticket.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-600">-</span>
                        )}
                      </td>
                      <td>
                        {ticket.dueDate ? (
                          <span className={`text-sm ${isOverdue ? 'text-red-400 font-medium' : isDueSoon ? 'text-amber-400' : 'text-zinc-400'}`}>
                            {isOverdue && '! '}{format(new Date(ticket.dueDate), 'd MMM', { locale: it })}
                          </span>
                        ) : (
                          <span className="text-sm text-zinc-600">-</span>
                        )}
                      </td>
                      <td className="text-sm text-zinc-500">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: it })}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditModal(ticket)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteTicket(ticket.id)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTicket ? 'Modifica Ticket' : 'Nuovo Ticket'}</h2>
            </div>
            <div className="modal-body space-y-6">
              <div>
                <label className="label">Nome Ticket *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Titolo del ticket..." className="input" autoFocus />
              </div>

              <div>
                <label className="label">Descrizione</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Descrivi il problema..." className="input" rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Priorita</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })} className="input">
                    {priorityOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Categoria</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input">
                    <option value="">Seleziona...</option>
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Assegna a</label>
                  <select value={formData.assigneeId} onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })} className="input">
                    <option value="">Non assegnato</option>
                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Scadenza</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="input" min={format(new Date(), 'yyyy-MM-dd')} />
                </div>
              </div>

              <div>
                <label className="label">Tags (separati da virgola)</label>
                <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="urgente, frontend, api..." className="input" />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="btn btn-ghost">Annulla</button>
              <button onClick={editingTicket ? handleUpdateTicket : handleCreateTicket} disabled={!formData.name.trim() || isSubmitting} className="btn btn-primary disabled:opacity-40">
                {isSubmitting ? 'Salvataggio...' : editingTicket ? 'Salva' : 'Crea'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {isDetailOpen && selectedTicket && (
        <div className="modal-overlay" onClick={() => setIsDetailOpen(false)}>
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-zinc-900 border-l border-white/[0.06] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10">
              <h2 className="text-lg font-semibold text-white">Dettagli Ticket</h2>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`badge ${statusOptions.find(s => s.value === selectedTicket.status)?.color}`}>
                    {statusOptions.find(s => s.value === selectedTicket.status)?.label}
                  </span>
                  <span className={`badge ${priorityOptions.find(p => p.value === selectedTicket.priority)?.color}`}>
                    {priorityOptions.find(p => p.value === selectedTicket.priority)?.label}
                  </span>
                  {selectedTicket.category && <span className="badge badge-default">{selectedTicket.category}</span>}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{selectedTicket.name}</h3>
                {selectedTicket.description && <p className="text-zinc-400 text-sm whitespace-pre-wrap">{selectedTicket.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Creato da</p>
                  {selectedTicket.author && (
                    <div className="flex items-center gap-2">
                      <div className="avatar w-8 h-8 rounded-lg text-[12px]">{selectedTicket.author.name.charAt(0).toUpperCase()}</div>
                      <span className="text-sm text-white">{selectedTicket.author.name}</span>
                    </div>
                  )}
                </div>
                <div className="card p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Assegnato a</p>
                  {selectedTicket.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="avatar w-8 h-8 rounded-lg text-[12px]">{selectedTicket.assignee.name.charAt(0).toUpperCase()}</div>
                      <span className="text-sm text-white">{selectedTicket.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-500">Non assegnato</span>
                  )}
                </div>
              </div>

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
                {selectedTicket.resolutionTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Tempo risoluzione</span>
                    <span className="text-sm text-zinc-300">{selectedTicket.resolutionTime < 60 ? `${selectedTicket.resolutionTime} min` : `${Math.round(selectedTicket.resolutionTime / 60)} ore`}</span>
                  </div>
                )}
              </div>

              {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTicket.tags.map(tag => (
                      <span key={tag} className="text-xs text-zinc-400 bg-zinc-800 px-3 py-1.5 rounded-lg">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                <button onClick={() => { setIsDetailOpen(false); openEditModal(selectedTicket); }} className="btn btn-secondary flex-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifica
                </button>
                <button onClick={() => handleDeleteTicket(selectedTicket.id)} className="btn btn-danger">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
