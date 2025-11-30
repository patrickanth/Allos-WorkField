'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Plus,
  Search,
  Download,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
  Settings,
  Columns3,
  LayoutGrid,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
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

const statusIcons: Record<string, React.ReactNode> = {
  open: <Circle className="w-4 h-4 text-blue-500" />,
  in_progress: <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />,
  resolved: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  closed: <CheckCircle2 className="w-4 h-4 text-dark-400" />,
};

const priorityColors: Record<string, string> = {
  low: 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300',
  medium: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  high: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<(Ticket & { author?: { id: string; name: string; avatar: string | null }; assignee?: { id: string; name: string; avatar: string | null } | null })[]>([]);
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

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    reactionTime: '',
    resolutionTime: '',
  });

  // Column config state
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
      if (Array.isArray(data)) {
        setTickets(data);
      }
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
      if (data?.columns) {
        setTableConfig(data);
      }
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
    if (!confirm('Sei sicuro di voler eliminare questo ticket?')) return;

    try {
      const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTickets(tickets.filter(t => t.id !== id));
      }
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
    setFormData({
      name: '',
      description: '',
      priority: 'medium',
      reactionTime: '',
      resolutionTime: '',
    });
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
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-dark-400" />
        </div>
        <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
          Nessun team
        </h2>
        <p className="text-dark-500 text-center max-w-md">
          Devi far parte di un team per vedere e gestire i ticket.
          Vai nella sezione Team per creare o unirti a un team.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
            Tickets
          </h1>
          <p className="text-dark-500 mt-1">
            Gestisci i ticket del tuo team
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setIsConfigModalOpen(true)}>
            <Columns3 className="w-5 h-5" />
            Configura Colonne
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-5 h-5" />
            Esporta Excel
          </Button>
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5" />
            Nuovo Ticket
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Cerca ticket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <Select
          options={[{ value: 'all', label: 'Tutti gli stati' }, ...statusOptions]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <Select
          options={[{ value: 'all', label: 'Tutte le priorità' }, ...priorityOptions]}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Totale', value: tickets.length, color: 'bg-primary-500' },
          { label: 'Aperti', value: tickets.filter(t => t.status === 'open').length, color: 'bg-blue-500' },
          { label: 'In Corso', value: tickets.filter(t => t.status === 'in_progress').length, color: 'bg-amber-500' },
          { label: 'Risolti', value: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length, color: 'bg-emerald-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-dark-500 mb-1">{stat.label}</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stat.color}`} />
              <span className="text-2xl font-bold text-dark-900 dark:text-white">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm animate-pulse">
          <div className="p-4 border-b border-dark-100 dark:border-dark-700">
            <div className="h-6 bg-dark-200 dark:bg-dark-700 rounded w-1/4" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-dark-100 dark:border-dark-700">
              <div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white dark:bg-dark-800 rounded-xl"
        >
          <div className="w-20 h-20 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-10 h-10 text-dark-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
            Nessun ticket trovato
          </h3>
          <p className="text-dark-500 mb-6">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Prova a modificare i filtri'
              : 'Crea il primo ticket del team'}
          </p>
          {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
            <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
              <Plus className="w-5 h-5" />
              Crea il primo ticket
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100 dark:border-dark-700">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-dark-600 dark:text-dark-300">
                    Nome
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-dark-600 dark:text-dark-300">
                    Stato
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-dark-600 dark:text-dark-300">
                    Priorità
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-dark-600 dark:text-dark-300">
                    Tempo Reazione
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-dark-600 dark:text-dark-300">
                    Autore
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-dark-600 dark:text-dark-300">
                    Data
                  </th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredTickets.map((ticket) => (
                    <motion.tr
                      key={ticket.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-dark-100 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-dark-900 dark:text-white">
                            {ticket.name}
                          </p>
                          {ticket.description && (
                            <p className="text-sm text-dark-500 truncate max-w-xs">
                              {ticket.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-50 dark:bg-dark-700 border-0 text-sm cursor-pointer"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                          {priorityOptions.find(p => p.value === ticket.priority)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                        {ticket.reactionTime ? `${ticket.reactionTime} min` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={ticket.author?.name || ''} size="sm" />
                          <span className="text-sm text-dark-600 dark:text-dark-300">
                            {ticket.author?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-500">
                        {format(new Date(ticket.createdAt), 'd MMM yyyy', { locale: it })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === ticket.id ? null : ticket.id)}
                            className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-600 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-dark-400" />
                          </button>

                          <AnimatePresence>
                            {openMenuId === ticket.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-dark-100 dark:border-dark-700 py-2 z-10"
                              >
                                <button
                                  onClick={() => openEditModal(ticket)}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-700"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  Modifica
                                </button>
                                <button
                                  onClick={() => handleDeleteTicket(ticket.id)}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Elimina
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Ticket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingTicket ? 'Modifica Ticket' : 'Nuovo Ticket'}
        size="lg"
      >
        <div className="space-y-5">
          <Input
            label="Nome Ticket"
            placeholder="Es: Bug nella pagina login"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Descrizione"
            placeholder="Descrivi il problema o la richiesta..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          <Select
            label="Priorità"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tempo di Reazione (minuti)"
              type="number"
              placeholder="Es: 30"
              value={formData.reactionTime}
              onChange={(e) => setFormData({ ...formData, reactionTime: e.target.value })}
            />
            <Input
              label="Tempo di Risoluzione (minuti)"
              type="number"
              placeholder="Es: 120"
              value={formData.resolutionTime}
              onChange={(e) => setFormData({ ...formData, resolutionTime: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              Annulla
            </Button>
            <Button
              onClick={editingTicket ? handleUpdateTicket : handleCreateTicket}
              isLoading={isSubmitting}
              disabled={!formData.name.trim()}
            >
              {editingTicket ? 'Salva Modifiche' : 'Crea Ticket'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Column Config Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configura Colonne"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-dark-500">
            Aggiungi o rimuovi colonne personalizzate dalla tabella dei ticket.
          </p>

          {/* Current columns */}
          <div className="space-y-2">
            <h4 className="font-medium text-dark-900 dark:text-white">Colonne attuali</h4>
            <div className="space-y-2">
              {tableConfig?.columns.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-dark-900 dark:text-white">{col.name}</span>
                    <Badge variant="default" size="sm">{col.type}</Badge>
                  </div>
                  <button
                    onClick={() => handleRemoveColumn(col.id)}
                    className="p-1.5 rounded-lg hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors text-dark-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add new column */}
          <div className="space-y-3 p-4 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
            <h4 className="font-medium text-dark-900 dark:text-white">Aggiungi nuova colonna</h4>
            <div className="flex gap-3">
              <Input
                placeholder="Nome colonna"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="flex-1"
              />
              <Select
                options={[
                  { value: 'text', label: 'Testo' },
                  { value: 'number', label: 'Numero' },
                  { value: 'select', label: 'Selezione' },
                ]}
                value={newColumnType}
                onChange={(e) => setNewColumnType(e.target.value as 'text' | 'number' | 'select')}
              />
              <Button onClick={handleAddColumn} disabled={!newColumnName.trim()}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsConfigModalOpen(false)}>
              Chiudi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
