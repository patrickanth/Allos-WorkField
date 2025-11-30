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
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-neutral-100 tracking-wide">
            {view === 'private' ? 'Note Personali' : 'Note Team'}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {view === 'private'
              ? 'Visibili solo a te'
              : canShare
                ? 'Condivise con il team'
                : 'Unisciti a un team per vedere le note condivise'
            }
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="group relative px-6 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300 overflow-hidden"
        >
          <span className="relative z-10">Nuova nota</span>
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Cerca nelle note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:bg-neutral-900 transition-all duration-300"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 animate-pulse">
              <div className="h-3 bg-neutral-800 rounded w-16 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-neutral-800 rounded w-full" />
                <div className="h-4 bg-neutral-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-neutral-500 text-sm mb-2">
            {searchQuery ? 'Nessun risultato' : 'Nessuna nota'}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors mt-2"
            >
              Crea la prima nota
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-6 hover:bg-neutral-900/60 hover:border-neutral-700/50 transition-all duration-500 relative"
            >
              {/* Menu */}
              {note.authorId === session?.user?.id && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-neutral-800 transition-all duration-300 text-neutral-500"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {openMenuId === note.id && (
                    <div className="absolute right-0 mt-2 w-44 bg-neutral-900 border border-neutral-800 rounded-xl py-2 shadow-2xl z-20">
                      <button
                        onClick={() => openEditModal(note)}
                        className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
                      >
                        Modifica
                      </button>
                      {canShare && (
                        <button
                          onClick={() => handleTogglePrivacy(note)}
                          className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
                        >
                          {note.isPrivate ? 'Condividi con team' : 'Rendi privata'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-800 transition-colors"
                      >
                        Elimina
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Privacy badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  note.isPrivate
                    ? 'bg-neutral-800/80 text-neutral-400'
                    : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${note.isPrivate ? 'bg-neutral-500' : 'bg-emerald-400'}`} />
                  {note.isPrivate ? 'Privata' : 'Team'}
                </span>
              </div>

              {/* Content */}
              <p className="text-sm text-neutral-300 whitespace-pre-wrap line-clamp-5 mb-6 leading-relaxed">
                {note.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400">
                    {note.author?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-neutral-500">{note.author?.name}</span>
                </div>
                <span className="text-xs text-neutral-600">
                  {format(new Date(note.timestamp), 'HH:mm · d MMM', { locale: it })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-neutral-800">
              <h2 className="text-lg font-light text-neutral-100 tracking-wide">
                {editingNote ? 'Modifica nota' : 'Nuova nota'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Scrivi qui la tua nota..."
                rows={6}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 resize-none transition-all duration-300"
                autoFocus
              />

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`relative w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                    newNotePrivate ? 'border-neutral-400 bg-neutral-400' : 'border-neutral-600'
                  }`}>
                    {newNotePrivate && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-neutral-950" />
                      </div>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="privacy"
                    checked={newNotePrivate}
                    onChange={() => setNewNotePrivate(true)}
                    className="sr-only"
                  />
                  <span className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors">Privata</span>
                </label>

                <label className={`flex items-center gap-3 ${canShare ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} group`}>
                  <div className={`relative w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                    !newNotePrivate ? 'border-emerald-400 bg-emerald-400' : 'border-neutral-600'
                  }`}>
                    {!newNotePrivate && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-neutral-950" />
                      </div>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="privacy"
                    checked={!newNotePrivate}
                    onChange={() => canShare && setNewNotePrivate(false)}
                    disabled={!canShare}
                    className="sr-only"
                  />
                  <span className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors">Condivisa</span>
                </label>
              </div>

              {!canShare && (
                <p className="text-xs text-amber-500/80 bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-900/30">
                  Unisciti a un team per condividere le note
                </p>
              )}
            </div>

            <div className="p-6 border-t border-neutral-800 flex justify-end gap-4">
              <button
                onClick={() => { setIsModalOpen(false); setEditingNote(null); setNewNoteContent(''); }}
                className="px-5 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={editingNote ? handleUpdateNote : handleCreateNote}
                disabled={!newNoteContent.trim() || isSubmitting}
                className="px-6 py-2.5 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Salvataggio...' : (editingNote ? 'Salva' : 'Crea')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
