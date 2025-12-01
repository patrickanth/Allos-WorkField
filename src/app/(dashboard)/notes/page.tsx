'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Note } from '@/types';

export default function NotesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'private';

  const [notes, setNotes] = useState<(Note & { author?: { id: string; name: string; avatar: string | null } })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePrivate, setNewNotePrivate] = useState(view === 'private');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [view]);

  useEffect(() => {
    setNewNotePrivate(view === 'private');
  }, [view]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notes?type=${view}`);
      const data = await res.json();
      if (Array.isArray(data)) setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNoteContent, isPrivate: newNotePrivate }),
      });
      if (res.ok) {
        const newNote = await res.json();
        if ((view === 'private' && newNote.isPrivate) || (view === 'shared' && !newNote.isPrivate)) {
          setNotes([newNote, ...notes]);
        }
        setNewNoteContent('');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !newNoteContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNoteContent, isPrivate: newNotePrivate }),
      });
      if (res.ok) {
        const updatedNote = await res.json();
        setNotes(notes.map(n => n.id === updatedNote.id ? { ...n, ...updatedNote } : n));
        setEditingNote(null);
        setNewNoteContent('');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Eliminare questa nota?')) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
    setOpenMenuId(null);
  };

  const handleTogglePrivacy = async (note: Note) => {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrivate: !note.isPrivate }),
      });
      if (res.ok) fetchNotes();
    } catch (error) {
      console.error('Error toggling privacy:', error);
    }
    setOpenMenuId(null);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setNewNoteContent(note.content || '');
    setNewNotePrivate(note.isPrivate);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setNewNoteContent('');
    setNewNotePrivate(view === 'private');
    setIsModalOpen(true);
  };

  // Fixed: Added null check for note.content
  const filteredNotes = notes.filter(note =>
    (note.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canShare = session?.user?.teamId;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">{view === 'private' ? 'Note Private' : 'Note del Team'}</h1>
          <p className="page-subtitle">
            {view === 'private'
              ? 'Le tue annotazioni personali e private'
              : canShare
                ? 'Condivise con tutti i membri del team'
                : 'Unisciti a un team per iniziare a collaborare'
            }
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuova nota
        </button>
      </div>

      {/* Search */}
      <div className="mb-10">
        <div className="relative max-w-lg">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cerca nelle tue note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-14"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-8">
              <div className="skeleton h-6 w-24 mb-6" />
              <div className="space-y-3">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="empty-title">{searchQuery ? 'Nessun risultato trovato' : 'Nessuna nota presente'}</p>
            <p className="empty-text">{searchQuery ? 'Prova a modificare la tua ricerca' : 'Crea la tua prima nota per iniziare'}</p>
            {!searchQuery && (
              <button onClick={openCreateModal} className="btn btn-glow mt-8">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crea la prima nota
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="card p-7 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <span className={`badge ${note.isPrivate ? 'badge-purple' : 'badge-green'}`}>
                  {note.isPrivate ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Privata
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Team
                    </>
                  )}
                </span>
                {note.authorId === session?.user?.id && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    {openMenuId === note.id && (
                      <div className="dropdown">
                        <button onClick={() => openEditModal(note)} className="dropdown-item">
                          <span className="flex items-center gap-3">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifica
                          </span>
                        </button>
                        {canShare && (
                          <button onClick={() => handleTogglePrivacy(note)} className="dropdown-item">
                            <span className="flex items-center gap-3">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              {note.isPrivate ? 'Condividi con team' : 'Rendi privata'}
                            </span>
                          </button>
                        )}
                        <button onClick={() => handleDeleteNote(note.id)} className="dropdown-item dropdown-item-danger">
                          <span className="flex items-center gap-3">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Elimina
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <p className="text-[15px] text-zinc-300 whitespace-pre-wrap line-clamp-5 mb-6 leading-relaxed">
                {note.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-5 border-t border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="avatar w-8 h-8 rounded-lg text-[12px]">
                    {note.author?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[14px] text-zinc-400 font-medium">{note.author?.name}</span>
                </div>
                <span className="text-[13px] text-zinc-600">
                  {format(new Date(note.timestamp), 'HH:mm · d MMMM', { locale: it })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingNote ? 'Modifica nota' : 'Crea nuova nota'}</h2>
            </div>
            <div className="modal-body space-y-6">
              <div>
                <label className="label">Contenuto della nota</label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Scrivi qui la tua nota..."
                  className="input"
                  rows={6}
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Visibilità</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setNewNotePrivate(true)}
                    className={`btn flex-1 ${newNotePrivate ? 'btn-glow' : 'btn-secondary'}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Privata
                  </button>
                  <button
                    type="button"
                    onClick={() => canShare && setNewNotePrivate(false)}
                    disabled={!canShare}
                    className={`btn flex-1 ${!newNotePrivate ? 'btn-glow' : 'btn-secondary'} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Team
                  </button>
                </div>
                {!canShare && (
                  <p className="text-[13px] text-amber-400 mt-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Unisciti a un team per condividere le note
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setIsModalOpen(false); setEditingNote(null); setNewNoteContent(''); }} className="btn btn-ghost">
                Annulla
              </button>
              <button
                onClick={editingNote ? handleUpdateNote : handleCreateNote}
                disabled={!newNoteContent.trim() || isSubmitting}
                className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
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
                  editingNote ? 'Salva modifiche' : 'Crea nota'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
