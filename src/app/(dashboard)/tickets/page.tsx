'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Ticket, TableColumn } from '@/types';

const statusOptions = [
  { value: 'open', label: 'Aperto' },
  { value: 'in_progress', label: 'In Corso' },
  { value: 'resolved', label: 'Risolto' },
  { value: 'closed', label: 'Chiuso' },
];

const priorityOptions = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Critica' },
];

const priorityColors: Record<string, string> = {
  low: 'bg-neutral-800 text-neutral-400',
  medium: 'bg-blue-950 text-blue-400',
  high: 'bg-amber-950 text-amber-400',
  critical: 'bg-red-950 text-red-400',
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

  const handleExport = async () => {
    try {
      const res = await fetch('/api/tickets/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting:', error);
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
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-neutral-500 text-sm mb-2">Nessun team</p>
        <p className="text-neutral-600 text-xs">Unisciti a un team per gestire i ticket</p>
      </div>
    );
  }

  const stats = [
    { label: 'Totale', value: tickets.length },
    { label: 'Aperti', value: tickets.filter(t => t.status === 'open').length },
    { label: 'In Corso', value: tickets.filter(t => t.status === 'in_progress').length },
    { label: 'Chiusi', value: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-neutral-100">Tickets</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gestione ticket del team</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="px-3 py-2 text-sm text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded-lg hover:bg-neutral-900 transition-colors"
          >
            Colonne
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 text-sm text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded-lg hover:bg-neutral-900 transition-colors"
          >
            Esporta
          </button>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="px-4 py-2 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg hover:bg-white transition-colors"
          >
            Nuovo ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
            <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
            <p className="text-xl font-medium text-neutral-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Cerca..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-xs bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-neutral-700"
        >
          <option value="all">Tutti gli stati</option>
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-neutral-700"
        >
          <option value="all">Tutte le priorità</option>
          {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg animate-pulse">
          <div className="p-4 border-b border-neutral-800"><div className="h-4 bg-neutral-800 rounded w-1/4" /></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-neutral-800"><div className="h-4 bg-neutral-800 rounded w-3/4" /></div>
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-neutral-500 text-sm mb-4">Nessun ticket</p>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Crea il primo ticket
          </button>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Stato</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Priorità</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Reazione</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Autore</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Data</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-neutral-200">{ticket.name}</p>
                      {ticket.description && (
                        <p className="text-xs text-neutral-500 truncate max-w-xs">{ticket.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                        className="bg-neutral-800 border-0 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none cursor-pointer"
                      >
                        {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${priorityColors[ticket.priority]}`}>
                        {priorityOptions.find(p => p.value === ticket.priority)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400">
                      {ticket.reactionTime ? `${ticket.reactionTime} min` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-400">{ticket.author?.name}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {format(new Date(ticket.createdAt), 'd MMM yyyy', { locale: it })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === ticket.id ? null : ticket.id)}
                          className="p-1.5 rounded hover:bg-neutral-700 transition-colors text-neutral-500"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {openMenuId === ticket.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-neutral-900 border border-neutral-800 rounded-lg py-1 shadow-xl z-10">
                            <button
                              onClick={() => openEditModal(ticket)}
                              className="w-full text-left px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
                            >
                              Modifica
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(ticket.id)}
                              className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-neutral-800"
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-lg">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-sm font-medium text-neutral-100">
                {editingTicket ? 'Modifica ticket' : 'Nuovo ticket'}
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                  placeholder="Titolo del ticket"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 resize-none"
                  placeholder="Descrizione..."
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Priorità</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-700"
                >
                  {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Tempo Reazione (min)</label>
                  <input
                    type="number"
                    value={formData.reactionTime}
                    onChange={(e) => setFormData({ ...formData, reactionTime: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Tempo Risoluzione (min)</label>
                  <input
                    type="number"
                    value={formData.resolutionTime}
                    onChange={(e) => setFormData({ ...formData, resolutionTime: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                    placeholder="120"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-800 flex justify-end gap-3">
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={editingTicket ? handleUpdateTicket : handleCreateTicket}
                disabled={!formData.name.trim() || isSubmitting}
                className="px-4 py-2 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Salvataggio...' : (editingTicket ? 'Salva' : 'Crea')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-lg">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-sm font-medium text-neutral-100">Configura colonne</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                {tableConfig?.columns.map((col) => (
                  <div key={col.id} className="flex items-center justify-between p-2 bg-neutral-800 rounded-lg">
                    <span className="text-sm text-neutral-300">{col.name}</span>
                    <button
                      onClick={() => handleRemoveColumn(col.id)}
                      className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Nome colonna"
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                />
                <select
                  value={newColumnType}
                  onChange={(e) => setNewColumnType(e.target.value as 'text' | 'number' | 'select')}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-neutral-700"
                >
                  <option value="text">Testo</option>
                  <option value="number">Numero</option>
                  <option value="select">Selezione</option>
                </select>
                <button
                  onClick={handleAddColumn}
                  disabled={!newColumnName.trim()}
                  className="px-3 py-2 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                  Aggiungi
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
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
