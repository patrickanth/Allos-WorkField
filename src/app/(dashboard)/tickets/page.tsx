'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Ticket, Client, User } from '@/types';

const statusOptions = [
  { value: 'open', label: 'Aperto', badge: 'badge-blue', icon: '⚪' },
  { value: 'in_progress', label: 'In Corso', badge: 'badge-amber', icon: '🟡' },
  { value: 'resolved', label: 'Risolto', badge: 'badge-green', icon: '🟢' },
  { value: 'closed', label: 'Chiuso', badge: 'badge-default', icon: '⚫' },
];

const priorityOptions = [
  { value: 'low', label: 'Bassa', badge: 'badge-default', icon: '⬇️' },
  { value: 'medium', label: 'Media', badge: 'badge-blue', icon: '➡️' },
  { value: 'high', label: 'Alta', badge: 'badge-amber', icon: '⬆️' },
  { value: 'critical', label: 'Critica', badge: 'badge-red', icon: '🔴' },
];

const categoryOptions = [
  'Support',
  'Bug',
  'Feature Request',
  'Incident',
  'Maintenance',
  'Question',
  'Other',
];

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<(Ticket & { author?: User; assignee?: User | null; client?: Client })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    status: 'open',
    category: '',
    tags: [] as string[],
    dueDate: '',
    clientId: '',
    assigneeId: '',
  });

  useEffect(() => {
    if (session?.user?.teamId) {
      Promise.all([fetchTickets(), fetchClients(), fetchTeamMembers()]);
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.teamId]);

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

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (Array.isArray(data)) setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/teams/members');
      const data = await res.json();
      if (Array.isArray(data)) setTeamMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim()) return;
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClientName.trim() }),
      });
      if (res.ok) {
        const newClient = await res.json();
        setClients([...clients, newClient]);
        setFormData({ ...formData, clientId: newClient.id });
        setNewClientName('');
        setShowNewClientForm(false);
      }
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.filter(t => t.trim()),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        clientId: formData.clientId || null,
        assigneeId: formData.assigneeId || null,
        category: formData.category || null,
      };
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newTicket = await res.json();
        setTickets([newTicket, ...tickets]);
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
    if (!editingTicket) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.filter(t => t.trim()),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        clientId: formData.clientId || null,
        assigneeId: formData.assigneeId || null,
        category: formData.category || null,
      };
      const res = await fetch(`/api/tickets/${editingTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(tickets.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t));
        resetForm();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(tickets.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('Eliminare questo ticket?')) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
      if (res.ok) setTickets(tickets.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const handleExport = async (type: 'xlsx' | 'csv') => {
    try {
      const res = await fetch(`/api/tickets/export${type === 'csv' ? '?format=csv' : ''}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets_${format(new Date(), 'yyyy-MM-dd')}.${type}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priority: 'medium',
      status: 'open',
      category: '',
      tags: [],
      dueDate: '',
      clientId: '',
      assigneeId: '',
    });
    setEditingTicket(null);
  };

  const openEditModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      description: ticket.description || '',
      priority: ticket.priority,
      status: ticket.status,
      category: ticket.category || '',
      tags: ticket.tags || [],
      dueDate: ticket.dueDate ? format(new Date(ticket.dueDate), 'yyyy-MM-dd') : '',
      clientId: ticket.clientId || '',
      assigneeId: ticket.assigneeId || '',
    });
    setIsModalOpen(true);
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmed] });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = (ticket.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (ticket.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!session?.user?.teamId) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Tickets</h1>
          <p className="page-subtitle">Sistema di gestione ticket</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="empty-title">Team richiesto</p>
            <p className="empty-text">Unisciti a un team per gestire i ticket</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Totale', value: tickets.length, color: 'from-zinc-600 to-zinc-700', icon: '📊' },
    { label: 'Aperti', value: tickets.filter(t => t.status === 'open').length, color: 'from-blue-600 to-blue-700', icon: '🔵' },
    { label: 'In Corso', value: tickets.filter(t => t.status === 'in_progress').length, color: 'from-amber-600 to-amber-700', icon: '🟡' },
    { label: 'Completati', value: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length, color: 'from-emerald-600 to-emerald-700', icon: '✅' },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-subtitle">Gestione e monitoraggio completo dei ticket del team</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={() => handleExport('xlsx')} className="btn btn-secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Esporta</span>
          </button>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="btn btn-glow">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nuovo ticket</span>
            <span className="sm:hidden">Nuovo</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
            <div className="flex items-center justify-between mb-3">
              <p className="stat-label">{stat.label}</p>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Filtri</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cerca per titolo o descrizione..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-14"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="all">Tutti gli stati</option>
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input"
          >
            <option value="all">Tutte le priorità</option>
            {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>)}
          </select>
        </div>
        {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
          <div className="mt-4 flex items-center gap-3 text-[14px] text-zinc-400">
            <span>Risultati: <span className="text-white font-semibold">{filteredTickets.length}</span></span>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPriorityFilter('all'); }}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Resetta filtri
            </button>
          </div>
        )}
      </div>

      {/* Tickets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-6 w-32 mb-4" />
              <div className="skeleton h-4 w-full mb-3" />
              <div className="skeleton h-4 w-3/4 mb-4" />
              <div className="skeleton h-10 w-full" />
            </div>
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="empty-title">Nessun ticket trovato</p>
            <p className="empty-text">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Prova a modificare i filtri di ricerca'
                : 'Crea il primo ticket per iniziare'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
              <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="btn btn-glow mt-8">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crea primo ticket
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="card group">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <h3 className="text-[17px] font-semibold text-white leading-tight flex-1">{ticket.name}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(ticket)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTicket(ticket.id)}
                    className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Client & Category */}
              {(ticket.client || ticket.category) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {ticket.client && (
                    <span className="badge badge-blue">
                      👤 {ticket.client.name}
                    </span>
                  )}
                  {ticket.category && (
                    <span className="badge badge-default">
                      📁 {ticket.category}
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              {ticket.description && (
                <div className="mb-5">
                  <p className={`text-[14px] text-zinc-400 leading-relaxed ${expandedTicket === ticket.id ? '' : 'line-clamp-2'}`}>
                    {ticket.description}
                  </p>
                  {ticket.description.length > 100 && (
                    <button
                      onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                      className="text-[13px] text-indigo-400 hover:text-indigo-300 mt-2 transition-colors"
                    >
                      {expandedTicket === ticket.id ? 'Mostra meno' : 'Mostra tutto'}
                    </button>
                  )}
                </div>
              )}

              {/* Tags */}
              {ticket.tags && ticket.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {ticket.tags.map((tag, idx) => (
                    <span key={idx} className="badge badge-default text-[12px]">
                      🏷️ {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 mb-5 pb-5 border-b border-white/[0.06]">
                <span className={`badge ${priorityOptions.find(p => p.value === ticket.priority)?.badge}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {priorityOptions.find(p => p.value === ticket.priority)?.label}
                </span>

                <select
                  value={ticket.status}
                  onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                  className={`badge cursor-pointer hover:opacity-80 transition-opacity ${statusOptions.find(s => s.value === ticket.status)?.badge}`}
                  style={{ appearance: 'none', paddingRight: '28px', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'white\' d=\'M6 9L1.5 4.5 2.9 3.1 6 6.2 9.1 3.1 10.5 4.5z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                >
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>

                {ticket.dueDate && (
                  <div className="flex items-center gap-2 text-[13px] text-zinc-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Scadenza: {format(new Date(ticket.dueDate), 'd MMM', { locale: it })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="avatar w-9 h-9 rounded-xl text-[13px] shrink-0">
                    {ticket.author?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-zinc-500">Creato da</p>
                    <p className="text-[14px] text-white font-medium truncate">{ticket.author?.name}</p>
                  </div>
                </div>

                {ticket.assignee && (
                  <div className="flex items-center gap-2 text-[13px] text-zinc-400">
                    <span>→</span>
                    <div className="avatar w-8 h-8 rounded-lg text-[12px]">
                      {ticket.assignee.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTicket ? 'Modifica ticket' : 'Crea nuovo ticket'}</h2>
              <p className="text-[14px] text-zinc-500 mt-2">Compila tutti i campi necessari per gestire il ticket</p>
            </div>
            <div className="modal-body space-y-6">
              {/* Title */}
              <div>
                <label className="label required">Titolo del ticket</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="es. Problema con il login"
                  autoFocus
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="label">Descrizione dettagliata</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full min-h-[100px] resize-none"
                  placeholder="Descrivi il problema o la richiesta in modo dettagliato..."
                />
              </div>

              {/* Client & Category Row */}
              <div className="grid grid-cols-2 gap-6">
                {/* Client */}
                <div>
                  <label className="label">Cliente</label>
                  {!showNewClientForm ? (
                    <div className="space-y-2">
                      <select
                        value={formData.clientId}
                        onChange={(e) => {
                          if (e.target.value === '__new__') {
                            setShowNewClientForm(true);
                          } else {
                            setFormData({ ...formData, clientId: e.target.value });
                          }
                        }}
                        className="input w-full"
                      >
                        <option value="">Nessun cliente</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                        <option value="__new__">+ Aggiungi nuovo cliente</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="input flex-1"
                        placeholder="Nome nuovo cliente"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateClient()}
                      />
                      <button onClick={handleCreateClient} className="btn btn-glow px-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button onClick={() => { setShowNewClientForm(false); setNewClientName(''); }} className="btn px-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="label">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">Seleziona categoria</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignee & Due Date Row */}
              <div className="grid grid-cols-2 gap-6">
                {/* Assignee */}
                <div>
                  <label className="label">Assegnato a</label>
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">Non assegnato</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="label">Data scadenza</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="label">Tags</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Aggiungi tag e premi Enter"
                      className="input flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <span key={idx} className="badge badge-blue flex items-center gap-2">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label">Priorità</label>
                  <div className="grid grid-cols-2 gap-2">
                    {priorityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: opt.value })}
                        className={`btn ${formData.priority === opt.value ? 'btn-glow' : 'btn-secondary'} py-3`}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="text-[13px]">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Stato</label>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.slice(0, 2).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: opt.value })}
                        className={`btn ${formData.status === opt.value ? 'btn-glow' : 'btn-secondary'} py-3`}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="text-[13px]">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="btn btn-ghost">
                Annulla
              </button>
              <button
                onClick={editingTicket ? handleUpdateTicket : handleCreateTicket}
                disabled={!formData.name.trim() || isSubmitting}
                className="btn btn-glow disabled:opacity-40 disabled:cursor-not-allowed"
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
                  editingTicket ? 'Salva modifiche' : 'Crea ticket'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
