'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Ticket, TableColumn } from '@/types';

const statusOptions = [
  { value: 'open', label: 'Aperto', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Corso', color: 'bg-amber-500' },
  { value: 'resolved', label: 'Risolto', color: 'bg-emerald-500' },
  { value: 'closed', label: 'Chiuso', color: 'bg-neutral-500' },
];

const priorityOptions = [
  { value: 'low', label: 'Bassa', color: 'bg-neutral-400' },
  { value: 'medium', label: 'Media', color: 'bg-blue-400' },
  { value: 'high', label: 'Alta', color: 'bg-amber-400' },
  { value: 'critical', label: 'Critica', color: 'bg-red-400' },
];

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<(Ticket & { author?: { id: string; name: string; avatar: string | null } })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableConfig, setTableConfig] = useState<{ columns: TableColumn[] } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    reactionTime: '',
    resolutionTime: '',
  });

  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'text' | 'number' | 'select'>('text');

  useEffect(() => {
    if (session?.user?.teamId) {
      fetchTickets();
      fetchTableConfig();
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

  const fetchTableConfig = async () => {
    try {
      const res = await fetch('/api/table-config');
      const data = await res.json();
      if (data?.columns) setTableConfig(data);
    } catch (error) {
      console.error('Error fetching table config:', error);
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
          name: formData.name,
          description: formData.description || null,
          priority: formData.priority,
          reactionTime: formData.reactionTime ? parseInt(formData.reactionTime) : null,
          resolutionTime: formData.resolutionTime ? parseInt(formData.resolutionTime) : null,
        }),
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
      const res = await fetch(`/api/tickets/${editingTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          priority: formData.priority,
          reactionTime: formData.reactionTime ? parseInt(formData.reactionTime) : null,
          resolutionTime: formData.resolutionTime ? parseInt(formData.resolutionTime) : null,
        }),
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
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
        setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
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
    setOpenMenuId(null);
  };

  const handleExport = async (type: 'xlsx' | 'csv') => {
    setExportLoading(true);
    setExportMenuOpen(false);
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
    } finally {
      setExportLoading(false);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim() || !tableConfig) return;
    const newColumn: TableColumn = {
      id: crypto.randomUUID(),
      name: newColumnName,
      type: newColumnType,
      required: false,
    };
    const updatedColumns = [...tableConfig.columns, newColumn];
    try {
      const res = await fetch('/api/table-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: updatedColumns }),
      });
      if (res.ok) {
        const data = await res.json();
        setTableConfig(data);
        setNewColumnName('');
      }
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  const handleRemoveColumn = async (columnId: string) => {
    if (!tableConfig) return;
    const updatedColumns = tableConfig.columns.filter(c => c.id !== columnId);
    try {
      const res = await fetch('/api/table-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: updatedColumns }),
      });
      if (res.ok) {
        const data = await res.json();
        setTableConfig(data);
      }
    } catch (error) {
      console.error('Error removing column:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', priority: 'medium', reactionTime: '', resolutionTime: '' });
    setEditingTicket(null);
  };

  const openEditModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      description: ticket.description || '',
      priority: ticket.priority,
      reactionTime: ticket.reactionTime?.toString() || '',
      resolutionTime: ticket.resolutionTime?.toString() || '',
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!session?.user?.teamId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-16">
        <div className="relative mb-10">
          <div className="w-32 h-32 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
              <svg className="w-9 h-9 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        </div>
        <p className="text-white/50 text-xl mb-3 font-light">Nessun team</p>
        <p className="text-white/30 text-base">Unisciti a un team per gestire i ticket</p>
      </div>
    );
  }

  const stats = [
    { label: 'Totale', value: tickets.length, style: 'status-pill priority-low' },
    { label: 'Aperti', value: tickets.filter(t => t.status === 'open').length, style: 'status-pill status-open' },
    { label: 'In Corso', value: tickets.filter(t => t.status === 'in_progress').length, style: 'status-pill status-progress' },
    { label: 'Completati', value: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length, style: 'status-pill status-resolved' },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Main content with generous padding */}
      <div className="px-16 py-14 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-16 pt-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4 font-medium">
              Gestione Team
            </p>
            <h1 className="text-5xl font-extralight text-white tracking-tight mb-3">
              Tickets
            </h1>
            <p className="text-lg text-white/40 font-light">
              Gestione ticket del team
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="premium-btn px-7 py-4 text-base text-white/70"
            >
              Configura
            </button>
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="premium-btn px-7 py-4 text-base text-white/70"
              >
                {exportLoading ? 'Esportazione...' : 'Esporta'}
              </button>
              {exportMenuOpen && (
                <div className="absolute right-0 mt-3 w-52 modal-content py-3 z-20">
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="w-full text-left px-6 py-3.5 text-base text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-6 py-3.5 text-base text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    CSV (.csv)
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="primary-btn px-10 py-4 text-base"
            >
              Nuovo ticket
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-14">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="elegant-card p-8 hover:scale-[1.02] transition-all duration-500"
            >
              <p className="text-sm text-white/40 uppercase tracking-wider mb-4 font-medium">{stat.label}</p>
              <p className="text-5xl font-extralight text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-5 mb-10">
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Cerca nei ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="elegant-input w-full px-7 py-5 text-base text-white"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/25">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="elegant-input px-6 py-5 text-base text-white/70 cursor-pointer min-w-[180px]"
          >
            <option value="all">Tutti gli stati</option>
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="elegant-input px-6 py-5 text-base text-white/70 cursor-pointer min-w-[180px]"
          >
            <option value="all">Tutte le priorità</option>
            {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="elegant-table">
            <div className="p-7 border-b border-white/[0.06]">
              <div className="h-5 bg-white/5 rounded w-1/4 animate-pulse" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-7 border-b border-white/[0.04]">
                <div className="h-5 bg-white/5 rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 elegant-card">
            <div className="relative mb-10">
              <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-white/50 text-xl mb-4 font-light">Nessun ticket</p>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="text-base text-white/30 hover:text-white/60 transition-colors"
            >
              Crea il primo ticket
            </button>
          </div>
        ) : (
          <div className="elegant-table">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-8 py-6 text-xs font-medium text-white/30 uppercase tracking-[0.15em]">Ticket</th>
                    <th className="text-left px-8 py-6 text-xs font-medium text-white/30 uppercase tracking-[0.15em]">Stato</th>
                    <th className="text-left px-8 py-6 text-xs font-medium text-white/30 uppercase tracking-[0.15em]">Priorità</th>
                    <th className="text-left px-8 py-6 text-xs font-medium text-white/30 uppercase tracking-[0.15em]">Tempo Reazione</th>
                    <th className="text-left px-8 py-6 text-xs font-medium text-white/30 uppercase tracking-[0.15em]">Autore</th>
                    <th className="text-left px-8 py-6 text-xs font-medium text-white/30 uppercase tracking-[0.15em]">Data</th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-all duration-300 group"
                    >
                      <td className="px-8 py-6">
                        <p className="text-base text-white/80 font-medium mb-1">{ticket.name}</p>
                        {ticket.description && (
                          <p className="text-sm text-white/40 truncate max-w-sm">{ticket.description}</p>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                          className={`status-pill cursor-pointer ${
                            ticket.status === 'open' ? 'status-open' :
                            ticket.status === 'in_progress' ? 'status-progress' :
                            ticket.status === 'resolved' ? 'status-resolved' : 'status-closed'
                          }`}
                        >
                          {statusOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">{opt.label}</option>)}
                        </select>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`status-pill ${
                          ticket.priority === 'low' ? 'priority-low' :
                          ticket.priority === 'medium' ? 'priority-medium' :
                          ticket.priority === 'high' ? 'priority-high' : 'priority-critical'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${priorityOptions.find(p => p.value === ticket.priority)?.color}`} />
                          {priorityOptions.find(p => p.value === ticket.priority)?.label}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-base text-white/50">
                          {ticket.reactionTime ? `${ticket.reactionTime} min` : '—'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="avatar w-9 h-9 rounded-xl text-sm text-white/50">
                            {ticket.author?.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-white/50">{ticket.author?.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-white/40">
                        {format(new Date(ticket.createdAt), 'd MMM yyyy', { locale: it })}
                      </td>
                      <td className="px-8 py-6">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === ticket.id ? null : ticket.id)}
                            className="p-3 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all duration-300 text-white/30 hover:text-white/60"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {openMenuId === ticket.id && (
                            <div className="absolute right-0 mt-2 w-52 modal-content py-3 z-20">
                              <button
                                onClick={() => openEditModal(ticket)}
                                className="w-full text-left px-6 py-3.5 text-base text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                Modifica
                              </button>
                              <button
                                onClick={() => handleDeleteTicket(ticket.id)}
                                className="w-full text-left px-6 py-3.5 text-base text-red-400/80 hover:text-red-400 hover:bg-white/5 transition-colors"
                              >
                                Elimina
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-8 z-50">
          <div className="modal-content w-full max-w-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2" />

            <div className="relative">
              <div className="px-10 py-8 border-b border-white/[0.06]">
                <h2 className="text-2xl font-light text-white tracking-tight">
                  {editingTicket ? 'Modifica ticket' : 'Nuovo ticket'}
                </h2>
              </div>
              <div className="p-10 space-y-8">
                <div>
                  <label className="block text-sm text-white/40 uppercase tracking-[0.15em] mb-3 font-medium">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="elegant-input w-full px-6 py-5 text-lg"
                    placeholder="Titolo del ticket"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/40 uppercase tracking-[0.15em] mb-3 font-medium">Descrizione</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="elegant-input w-full px-6 py-5 text-base resize-none"
                    placeholder="Descrizione opzionale..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/40 uppercase tracking-[0.15em] mb-3 font-medium">Priorità</label>
                  <div className="flex gap-3">
                    {priorityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: opt.value })}
                        className={`flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-base border transition-all duration-300 ${
                          formData.priority === opt.value
                            ? `status-pill ${opt.value === 'low' ? 'priority-low' : opt.value === 'medium' ? 'priority-medium' : opt.value === 'high' ? 'priority-high' : 'priority-critical'}`
                            : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/15'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-white/40 uppercase tracking-[0.15em] mb-3 font-medium">Tempo Reazione (min)</label>
                    <input
                      type="number"
                      value={formData.reactionTime}
                      onChange={(e) => setFormData({ ...formData, reactionTime: e.target.value })}
                      className="elegant-input w-full px-6 py-5 text-base"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 uppercase tracking-[0.15em] mb-3 font-medium">Tempo Risoluzione (min)</label>
                    <input
                      type="number"
                      value={formData.resolutionTime}
                      onChange={(e) => setFormData({ ...formData, resolutionTime: e.target.value })}
                      className="elegant-input w-full px-6 py-5 text-base"
                      placeholder="120"
                    />
                  </div>
                </div>
              </div>
              <div className="px-10 py-8 border-t border-white/[0.06] flex justify-end gap-5">
                <button
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-8 py-4 text-base text-white/40 hover:text-white/70 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={editingTicket ? handleUpdateTicket : handleCreateTicket}
                  disabled={!formData.name.trim() || isSubmitting}
                  className="primary-btn px-10 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Salvataggio...' : (editingTicket ? 'Salva' : 'Crea')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Column Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-8 z-50">
          <div className="modal-content w-full max-w-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2" />

            <div className="relative">
              <div className="px-10 py-8 border-b border-white/[0.06]">
                <h2 className="text-2xl font-light text-white tracking-tight">Configura tabella</h2>
                <p className="text-base text-white/40 mt-2">Aggiungi o rimuovi colonne personalizzate</p>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-4 max-h-72 overflow-y-auto">
                  {tableConfig?.columns.map((col) => (
                    <div
                      key={col.id}
                      className="flex items-center justify-between p-6 elegant-card group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="avatar w-12 h-12 rounded-xl text-sm text-white/40">
                          {col.type.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-base text-white/80">{col.name}</span>
                          <span className="text-sm text-white/30 uppercase tracking-wider ml-3">{col.type}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveColumn(col.id)}
                        className="p-3 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {(!tableConfig?.columns || tableConfig.columns.length === 0) && (
                    <p className="text-center text-white/30 text-base py-12">Nessuna colonna personalizzata</p>
                  )}
                </div>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Nome colonna"
                    className="elegant-input flex-1 px-6 py-5 text-base"
                  />
                  <select
                    value={newColumnType}
                    onChange={(e) => setNewColumnType(e.target.value as 'text' | 'number' | 'select')}
                    className="elegant-input px-6 py-5 text-base cursor-pointer"
                  >
                    <option value="text">Testo</option>
                    <option value="number">Numero</option>
                    <option value="select">Selezione</option>
                  </select>
                  <button
                    onClick={handleAddColumn}
                    disabled={!newColumnName.trim()}
                    className="primary-btn px-8 py-5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Aggiungi
                  </button>
                </div>
              </div>
              <div className="px-10 py-8 border-t border-white/[0.06] flex justify-end">
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-8 py-4 text-base text-white/40 hover:text-white/70 transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
