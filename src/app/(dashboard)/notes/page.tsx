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
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== id));
      }
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
      if (res.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error('Error toggling privacy:', error);
    }
    setOpenMenuId(null);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setNewNoteContent(note.content);
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

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canShare = session?.user?.teamId;

  return (
    <div className="min-h-screen relative lamp-container">
      {/* Main content with generous padding */}
      <div className="px-16 py-14 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-16 pt-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4 font-medium">
              {view === 'private' ? 'Spazio Personale' : 'Spazio Condiviso'}
            </p>
            <h1 className="text-5xl font-extralight text-white tracking-tight mb-3">
              {view === 'private' ? 'Note' : 'Note Team'}
            </h1>
            <p className="text-lg text-white/40 font-light">
              {view === 'private'
                ? 'Le tue annotazioni private'
                : canShare
                  ? 'Condivise con il tuo team'
                  : 'Unisciti a un team per collaborare'
              }
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="primary-btn px-10 py-4 text-base"
          >
            Nuova nota
          </button>
        </div>

        {/* Search */}
        <div className="mb-14">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Cerca nelle note..."
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
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="elegant-card p-10 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-24 mb-8" />
                <div className="space-y-4">
                  <div className="h-5 bg-white/5 rounded w-full" />
                  <div className="h-5 bg-white/5 rounded w-4/5" />
                  <div className="h-5 bg-white/5 rounded w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            {/* Decorative element */}
            <div className="relative mb-10">
              <div className="w-32 h-32 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                  <svg className="w-9 h-9 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
            </div>
            <p className="text-white/50 text-xl mb-4 font-light">
              {searchQuery ? 'Nessun risultato trovato' : 'Nessuna nota presente'}
            </p>
            {!searchQuery && (
              <button
                onClick={openCreateModal}
                className="text-base text-white/30 hover:text-white/60 transition-colors duration-300"
              >
                Crea la tua prima nota
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="elegant-card p-10 group relative transition-all duration-500"
              >
                {/* Menu */}
                {note.authorId === session?.user?.id && (
                  <div className="absolute top-8 right-8">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                      className="p-3 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all duration-300 text-white/30 hover:text-white/60"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {openMenuId === note.id && (
                      <div className="absolute right-0 mt-2 w-56 modal-content py-3 z-20">
                        <button
                          onClick={() => openEditModal(note)}
                          className="w-full text-left px-6 py-3.5 text-base text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          Modifica
                        </button>
                        {canShare && (
                          <button
                            onClick={() => handleTogglePrivacy(note)}
                            className="w-full text-left px-6 py-3.5 text-base text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {note.isPrivate ? 'Condividi con team' : 'Rendi privata'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="w-full text-left px-6 py-3.5 text-base text-red-400/80 hover:text-red-400 hover:bg-white/5 transition-colors"
                        >
                          Elimina
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Privacy indicator */}
                <div className="mb-8">
                  <div className={`status-pill ${note.isPrivate ? 'priority-low' : 'status-resolved'}`}>
                    <span className={`w-2 h-2 rounded-full ${note.isPrivate ? 'bg-white/40' : 'bg-emerald-400'}`} />
                    {note.isPrivate ? 'Privata' : 'Team'}
                  </div>
                </div>

                {/* Content */}
                <p className="text-lg text-white/70 whitespace-pre-wrap line-clamp-5 mb-10 leading-relaxed font-light">
                  {note.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
                  <div className="flex items-center gap-4">
                    <div className="avatar w-10 h-10 rounded-xl text-sm text-white/50">
                      {note.author?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-base text-white/40 font-light">{note.author?.name}</span>
                  </div>
                  <span className="text-sm text-white/25 font-light">
                    {format(new Date(note.timestamp), 'HH:mm · d MMM', { locale: it })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-8 z-50">
          <div className="modal-content w-full max-w-2xl relative overflow-hidden">
            {/* Decorative light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2" />

            <div className="relative">
              <div className="px-10 py-8 border-b border-white/[0.06]">
                <h2 className="text-2xl font-light text-white tracking-tight">
                  {editingNote ? 'Modifica nota' : 'Nuova nota'}
                </h2>
              </div>

              <div className="p-10 space-y-8">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Scrivi qui..."
                  rows={7}
                  className="elegant-input w-full px-6 py-5 text-lg resize-none font-light"
                  autoFocus
                />

                <div className="flex items-center gap-8">
                  <button
                    type="button"
                    onClick={() => setNewNotePrivate(true)}
                    className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 ${
                      newNotePrivate ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      newNotePrivate ? 'border-white bg-white' : 'border-white/30'
                    }`}>
                      {newNotePrivate && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <span className="text-base">Privata</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => canShare && setNewNotePrivate(false)}
                    disabled={!canShare}
                    className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 ${
                      !newNotePrivate ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/40 hover:text-white/60'
                    } ${!canShare ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      !newNotePrivate ? 'border-emerald-400 bg-emerald-400' : 'border-white/30'
                    }`}>
                      {!newNotePrivate && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <span className="text-base">Team</span>
                  </button>
                </div>

                {!canShare && (
                  <p className="text-sm text-amber-400/60 bg-amber-500/5 border border-amber-500/10 px-5 py-4 rounded-xl">
                    Unisciti a un team per condividere le note
                  </p>
                )}
              </div>

              <div className="px-10 py-8 border-t border-white/[0.06] flex justify-end gap-5">
                <button
                  onClick={() => { setIsModalOpen(false); setEditingNote(null); setNewNoteContent(''); }}
                  className="px-8 py-4 text-base text-white/40 hover:text-white/70 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={editingNote ? handleUpdateNote : handleCreateNote}
                  disabled={!newNoteContent.trim() || isSubmitting}
                  className="primary-btn px-10 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Salvataggio...' : (editingNote ? 'Salva' : 'Crea')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
