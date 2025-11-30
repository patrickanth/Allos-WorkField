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
  { value: 'low', label: 'Bassa', color: 'bg-neutral-500' },
  { value: 'medium', label: 'Media', color: 'bg-blue-500' },
  { value: 'high', label: 'Alta', color: 'bg-amber-500' },
  { value: 'critical', label: 'Critica', color: 'bg-red-500' },
];

const priorityStyles: Record<string, string> = {
  low: 'bg-neutral-900 text-neutral-400 border-neutral-800',
  medium: 'bg-blue-950/50 text-blue-400 border-blue-900/30',
  high: 'bg-amber-950/50 text-amber-400 border-amber-900/30',
  critical: 'bg-red-950/50 text-red-400 border-red-900/30',
};

const statusStyles: Record<string, string> = {
  open: 'bg-blue-950/50 text-blue-400 border-blue-900/30',
  in_progress: 'bg-amber-950/50 text-amber-400 border-amber-900/30',
  resolved: 'bg-emerald-950/50 text-emerald-400 border-emerald-900/30',
  closed: 'bg-neutral-900 text-neutral-500 border-neutral-800',
};

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
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
          <svg className="w-9 h-9 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-neutral-400 text-sm mb-2">Nessun team</p>
        <p className="text-neutral-600 text-xs">Unisciti a un team per gestire i ticket</p>
      </div>
    );
  }

  const stats = [
    { label: 'Totale', value: tickets.length, color: 'border-neutral-700' },
    { label: 'Aperti', value: tickets.filter(t => t.status === 'open').length, color: 'border-blue-900/50' },
    { label: 'In Corso', value: tickets.filter(t => t.status === 'in_progress').length, color: 'border-amber-900/50' },
    { label: 'Completati', value: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length, color: 'border-emerald-900/50' },
  ];

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-neutral-100 tracking-wide">Tickets</h1>
          <p className="text-sm text-neutral-500 mt-1">Gestione ticket del team</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="group relative px-4 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-all duration-300"
          >
            Configura
          </button>
          <div className="relative group">
            <button
              className="px-4 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-all duration-300"
            >
              {exportLoading ? 'Esportazione...' : 'Esporta'}
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-neutral-900 border border-neutral-800 rounded-xl py-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <button
                onClick={() => handleExport('xlsx')}
                className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                Excel (.xlsx)
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                CSV (.csv)
              </button>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="group relative px-6 py-2.5 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-xl hover:bg-white transition-all duration-300"
          >
            Nuovo ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-neutral-900/30 border ${stat.color} rounded-2xl p-5 hover:bg-neutral-900/50 transition-all duration-300`}
          >
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-3xl font-light text-neutral-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Cerca nei ticket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all duration-300"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-300 focus:outline-none focus:border-neutral-600 transition-all duration-300 cursor-pointer"
        >
          <option value="all">Tutti gli stati</option>
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-300 focus:outline-none focus:border-neutral-600 transition-all duration-300 cursor-pointer"
        >
          <option value="all">Tutte le priorità</option>
          {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-neutral-800">
            <div className="h-4 bg-neutral-800 rounded w-1/4 animate-pulse" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-5 border-b border-neutral-800">
              <div className="h-4 bg-neutral-800 rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-neutral-900/30 border border-neutral-800 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-neutral-500 text-sm mb-2">Nessun ticket</p>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors mt-2"
          >
            Crea il primo ticket
          </button>
        </div>
      ) : (
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-6 py-4 text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Ticket</th>
                  <th className="text-left px-6 py-4 text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Stato</th>
                  <th className="text-left px-6 py-4 text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Priorità</th>
                  <th className="text-left px-6 py-4 text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Tempo Reazione</th>
                  <th className="text-left px-6 py-4 text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Autore</th>
                  <th className="text-left px-6 py-4 text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Data</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-all duration-300 group"
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm text-neutral-200 font-medium mb-0.5">{ticket.name}</p>
                      {ticket.description && (
                        <p className="text-xs text-neutral-500 truncate max-w-xs">{ticket.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs border ${statusStyles[ticket.status]} bg-transparent focus:outline-none cursor-pointer transition-all duration-300`}
                      >
                        {statusOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-neutral-900">{opt.label}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border ${priorityStyles[ticket.priority]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityOptions.find(p => p.value === ticket.priority)?.color}`} />
                        {priorityOptions.find(p => p.value === ticket.priority)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-neutral-400">
                        {ticket.reactionTime ? `${ticket.reactionTime} min` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400">
                          {ticket.author?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-neutral-400">{ticket.author?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-neutral-500">
                      {format(new Date(ticket.createdAt), 'd MMM yyyy', { locale: it })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === ticket.id ? null : ticket.id)}
                          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-neutral-800 transition-all duration-300 text-neutral-500"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {openMenuId === ticket.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-neutral-900 border border-neutral-800 rounded-xl py-2 shadow-2xl z-20">
                            <button
                              onClick={() => openEditModal(ticket)}
                              className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
                            >
                              Modifica
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(ticket.id)}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-800 transition-colors"
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-neutral-800">
              <h2 className="text-lg font-light text-neutral-100 tracking-wide">
                {editingTicket ? 'Modifica ticket' : 'Nuovo ticket'}
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all duration-300"
                  placeholder="Titolo del ticket"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 resize-none transition-all duration-300"
                  placeholder="Descrizione opzionale..."
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">Priorità</label>
                <div className="flex gap-2">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: opt.value })}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm border transition-all duration-300 ${
                        formData.priority === opt.value
                          ? priorityStyles[opt.value]
                          : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">Tempo Reazione (min)</label>
                  <input
                    type="number"
                    value={formData.reactionTime}
                    onChange={(e) => setFormData({ ...formData, reactionTime: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all duration-300"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">Tempo Risoluzione (min)</label>
                  <input
                    type="number"
                    value={formData.resolutionTime}
                    onChange={(e) => setFormData({ ...formData, resolutionTime: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all duration-300"
                    placeholder="120"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-neutral-800 flex justify-end gap-4">
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="px-5 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={editingTicket ? handleUpdateTicket : handleCreateTicket}
                disabled={!formData.name.trim() || isSubmitting}
                className="px-6 py-2.5 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Salvataggio...' : (editingTicket ? 'Salva' : 'Crea')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-neutral-800">
              <h2 className="text-lg font-light text-neutral-100 tracking-wide">Configura tabella</h2>
              <p className="text-xs text-neutral-500 mt-1">Aggiungi o rimuovi colonne personalizzate</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {tableConfig?.columns.map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center justify-between p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl group hover:border-neutral-700 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                        <span className="text-[10px] text-neutral-400 uppercase">{col.type.charAt(0)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-neutral-200">{col.name}</span>
                        <span className="text-[10px] text-neutral-600 uppercase tracking-wider ml-2">{col.type}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveColumn(col.id)}
                      className="p-2 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                {(!tableConfig?.columns || tableConfig.columns.length === 0) && (
                  <p className="text-center text-neutral-600 text-sm py-8">Nessuna colonna personalizzata</p>
                )}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Nome colonna"
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all duration-300"
                />
                <select
                  value={newColumnType}
                  onChange={(e) => setNewColumnType(e.target.value as 'text' | 'number' | 'select')}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-300 focus:outline-none focus:border-neutral-600 cursor-pointer transition-all duration-300"
                >
                  <option value="text">Testo</option>
                  <option value="number">Numero</option>
                  <option value="select">Selezione</option>
                </select>
                <button
                  onClick={handleAddColumn}
                  disabled={!newColumnName.trim()}
                  className="px-5 py-3 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aggiungi
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="px-5 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
