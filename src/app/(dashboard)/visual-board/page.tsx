'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { VisualBoard } from '@/types';

export default function VisualBoardPage() {
  const { data: session } = useSession();
  const [boards, setBoards] = useState<VisualBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<VisualBoard | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (session?.user?.teamId) {
      loadBoards();
    } else {
      setLoading(false);
    }
  }, [session?.user?.teamId]);

  const loadBoards = async () => {
    try {
      const res = await fetch('/api/visual-boards');
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (board?: VisualBoard) => {
    if (board) {
      setEditingBoard(board);
      setFormData({
        name: board.name,
        description: board.description || '',
      });
    } else {
      setEditingBoard(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBoard(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBoard) {
        // Update existing board
        const res = await fetch(`/api/visual-boards/${editingBoard.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const updated = await res.json();
          setBoards(boards.map(b => b.id === updated.id ? updated : b));
          handleCloseModal();
        }
      } else {
        // Create new board
        const res = await fetch('/api/visual-boards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            nodes: [],
            edges: [],
          }),
        });

        if (res.ok) {
          const newBoard = await res.json();
          setBoards([...boards, newBoard]);
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error saving board:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa board?')) return;

    try {
      const res = await fetch(`/api/visual-boards/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBoards(boards.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  if (!session?.user?.teamId) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Visual Board</h1>
          <p className="page-subtitle">Mappa visuale intelligente</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="text-5xl mb-6">🔮</div>
            <h3 className="text-[18px] text-white font-medium mb-3">Team richiesto</h3>
            <p className="text-[14px] text-zinc-500">Unisciti a un team per creare mappe visuali</p>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Hero Header with Sci-Fi Style */}
      <div className="relative mb-12 overflow-hidden rounded-3xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Visual Board</h1>
              <p className="text-zinc-400 text-lg">Mappa e connetti le tue idee in uno spazio interattivo</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-indigo-400 mb-2">🎯</div>
              <h3 className="text-white font-semibold mb-1">Organizza</h3>
              <p className="text-zinc-400 text-sm">Visualizza relazioni complesse</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-purple-400 mb-2">🔗</div>
              <h3 className="text-white font-semibold mb-1">Connetti</h3>
              <p className="text-zinc-400 text-sm">Collega clienti, ticket e note</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-pink-400 mb-2">⚡</div>
              <h3 className="text-white font-semibold mb-1">Collabora</h3>
              <p className="text-zinc-400 text-sm">Lavora con il tuo team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[20px] font-semibold text-white mb-1">Le tue Board</h2>
          <p className="text-[14px] text-zinc-500">Crea e gestisci le tue mappe visuali</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-glow">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuova Board
        </button>
      </div>

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="text-6xl mb-6">🗺️</div>
            <h3 className="text-[18px] text-white font-medium mb-3">Nessuna board ancora</h3>
            <p className="text-[14px] text-zinc-500 mb-8 max-w-md">
              Crea la tua prima visual board per iniziare a mappare e collegare le tue idee
            </p>
            <button onClick={() => handleOpenModal()} className="btn btn-glow">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crea Prima Board
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div key={board.id} className="card group relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }} />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">
                    🗺️
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(board)}
                      className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center transition-colors"
                      title="Modifica"
                    >
                      <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(board.id)}
                      className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-red-500/20 border border-white/[0.06] hover:border-red-500/30 flex items-center justify-center transition-colors"
                      title="Elimina"
                    >
                      <svg className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <h3 className="text-[16px] text-white font-medium mb-2">{board.name}</h3>
                {board.description && (
                  <p className="text-[14px] text-zinc-500 mb-4 line-clamp-2">{board.description}</p>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 text-[13px] text-zinc-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {board.nodes?.length || 0} nodi
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-zinc-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {board.edges?.length || 0} link
                  </div>
                </div>

                <button className="w-full mt-4 btn btn-secondary text-[13px] py-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Visualizza Board
                </button>
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
                {editingBoard ? 'Modifica Board' : 'Nuova Visual Board'}
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
                    <label className="label required">Nome Board</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input w-full"
                      placeholder="Es: Strategia Q1 2025"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Descrizione</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input w-full min-h-[100px] resize-none"
                      placeholder="Descrivi lo scopo di questa visual board..."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn">
                  Annulla
                </button>
                <button type="submit" className="btn btn-glow">
                  {editingBoard ? 'Salva Modifiche' : 'Crea Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
