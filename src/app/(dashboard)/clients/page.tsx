'use client';

import { useState, useEffect } from 'react';
import type { Client } from '@/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        notes: client.notes || '',
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClient) {
        // Update existing client
        const res = await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const updated = await res.json();
          setClients(clients.map(c => c.id === updated.id ? updated : c));
          handleCloseModal();
        }
      } else {
        // Create new client
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const newClient = await res.json();
          setClients([...clients, newClient]);
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return;

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setClients(clients.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page">
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-500">Caricamento...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clienti</h1>
          <p className="page-subtitle">Gestisci i tuoi clienti e le informazioni di contatto</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-glow">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuovo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="card mb-8">
        <input
          type="text"
          placeholder="🔍 Cerca clienti per nome, azienda o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Results counter */}
      {searchQuery && (
        <div className="mb-6 text-[14px] text-zinc-400">
          {filteredClients.length} {filteredClients.length === 1 ? 'risultato' : 'risultati'}
          <button
            onClick={() => setSearchQuery('')}
            className="ml-3 text-indigo-400 hover:text-indigo-300"
          >
            Cancella ricerca
          </button>
        </div>
      )}

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="empty-state">
          <div className="text-5xl mb-6">👥</div>
          <h3 className="text-[18px] text-white font-medium mb-3">
            {searchQuery ? 'Nessun cliente trovato' : 'Nessun cliente ancora'}
          </h3>
          <p className="text-[14px] text-zinc-500 mb-8 max-w-md">
            {searchQuery
              ? 'Prova a modificare i criteri di ricerca'
              : 'Inizia aggiungendo il tuo primo cliente per organizzare meglio ticket e note'}
          </p>
          {!searchQuery && (
            <button onClick={() => handleOpenModal()} className="btn btn-glow">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Aggiungi Primo Cliente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="card group">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(client)}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center transition-colors"
                    title="Modifica"
                  >
                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-red-500/20 border border-white/[0.06] hover:border-red-500/30 flex items-center justify-center transition-colors"
                    title="Elimina"
                  >
                    <svg className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3 className="text-[16px] text-white font-medium mb-1">{client.name}</h3>
              {client.company && (
                <p className="text-[14px] text-zinc-400 mb-4">{client.company}</p>
              )}

              <div className="space-y-2.5">
                {client.email && (
                  <div className="flex items-center gap-2.5 text-[13px] text-zinc-500">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2.5 text-[13px] text-zinc-500">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.notes && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <p className="text-[13px] text-zinc-500 line-clamp-2">{client.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingClient ? 'Modifica Cliente' : 'Nuovo Cliente'}
              </h2>
              <button onClick={handleCloseModal} className="modal-close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="space-y-6">
                  <div>
                    <label className="label required">Nome Cliente</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input w-full"
                      placeholder="Es: Mario Rossi"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Azienda</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="input w-full"
                      placeholder="Es: Acme Corp"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input w-full"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="label">Telefono</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input w-full"
                        placeholder="+39 123 456 7890"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Note</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="input w-full min-h-[100px] resize-none"
                      placeholder="Informazioni aggiuntive sul cliente..."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn">
                  Annulla
                </button>
                <button type="submit" className="btn btn-glow">
                  {editingClient ? 'Salva Modifiche' : 'Crea Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
