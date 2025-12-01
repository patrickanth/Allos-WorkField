'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Ticket } from '@/types';

const statusOptions = [
  { value: 'open', label: 'Aperto', badge: 'badge-blue' },
  { value: 'in_progress', label: 'In Corso', badge: 'badge-amber' },
  { value: 'resolved', label: 'Risolto', badge: 'badge-green' },
  { value: 'closed', label: 'Chiuso', badge: 'badge-default' },
];

const priorityOptions = [
  { value: 'low', label: 'Bassa', badge: 'badge-default' },
  { value: 'medium', label: 'Media', badge: 'badge-blue' },
  { value: 'high', label: 'Alta', badge: 'badge-amber' },
  { value: 'critical', label: 'Critica', badge: 'badge-red' },
];

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<(Ticket & { author?: { id: string; name: string } })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    if (session?.user?.teamId) {
      fetchTickets();
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

  const handleCreateTicket = async () => {
    if (!formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
        body: JSON.stringify(formData),
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
    setFormData({ name: '', description: '', priority: 'medium' });
    setEditingTicket(null);
  };

  const openEditModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      description: ticket.description || '',
      priority: ticket.priority,
    });
    setIsModalOpen(true);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!session?.user?.teamId) {
    return (
      <div className="page">
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="empty-title">Nessun team</p>
            <p className="empty-text">Unisciti a un team per gestire i ticket</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Totale', value: tickets.length },
    { label: 'Aperti', value: tickets.filter(t => t.status === 'open').length },
    { label: 'In Corso', value: tickets.filter(t => t.status === 'in_progress').length },
    { label: 'Completati', value: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-subtitle">Gestione ticket del team</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('xlsx')} className="btn btn-secondary">
            Esporta
          </button>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="btn btn-primary">
            + Nuovo ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
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
          className="input max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">Tutti gli stati</option>
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="table-container">
          <div className="p-4">
            <div className="skeleton h-8 w-full mb-2" />
            <div className="skeleton h-8 w-full mb-2" />
            <div className="skeleton h-8 w-full" />
          </div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="empty-title">Nessun ticket</p>
            <p className="empty-text">Crea il primo ticket</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Stato</th>
                <th>Priorità</th>
                <th>Autore</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <p className="text-[14px] text-white font-medium">{ticket.name}</p>
                    {ticket.description && (
                      <p className="text-[13px] text-zinc-500 truncate max-w-xs">{ticket.description}</p>
                    )}
                  </td>
                  <td>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                      className={`badge cursor-pointer ${statusOptions.find(s => s.value === ticket.status)?.badge}`}
                    >
                      {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${priorityOptions.find(p => p.value === ticket.priority)?.badge}`}>
                      {priorityOptions.find(p => p.value === ticket.priority)?.label}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar w-6 h-6 rounded text-[10px]">
                        {ticket.author?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[13px] text-zinc-400">{ticket.author?.name}</span>
                    </div>
                  </td>
                  <td className="text-[13px] text-zinc-500">
                    {format(new Date(ticket.createdAt), 'd MMM', { locale: it })}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(ticket)} className="btn btn-ghost p-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteTicket(ticket.id)} className="btn btn-ghost p-2 text-red-400 hover:text-red-300">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTicket ? 'Modifica ticket' : 'Nuovo ticket'}</h2>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Titolo del ticket"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Descrizione opzionale..."
                />
              </div>
              <div>
                <label className="label">Priorità</label>
                <div className="flex gap-2">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: opt.value })}
                      className={`btn flex-1 ${formData.priority === opt.value ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
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
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Salvataggio...' : (editingTicket ? 'Salva' : 'Crea')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
