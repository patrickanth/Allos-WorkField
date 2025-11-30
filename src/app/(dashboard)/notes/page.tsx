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

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notes?type=${view}`);
      const data = await res.json();
      setNotes(data);
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
        setNotes([newNote, ...notes]);
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
        const updatedNote = await res.json();
        setNotes(notes.map(n => n.id === note.id ? { ...n, ...updatedNote } : n));
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-neutral-100">
            {view === 'private' ? 'Note Personali' : 'Note Team'}
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {view === 'private' ? 'Visibili solo a te' : 'Condivise con il team'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg hover:bg-white transition-colors"
        >
          Nuova nota
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cerca..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
        />
      </div>

      {/* Notes */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-neutral-800 rounded w-3/4 mb-3" />
              <div className="h-3 bg-neutral-800 rounded w-full mb-2" />
              <div className="h-3 bg-neutral-800 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500 text-sm mb-4">
            {searchQuery ? 'Nessun risultato' : 'Nessuna nota'}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Crea la prima nota
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 group relative"
            >
              {/* Menu */}
              {note.authorId === session?.user?.id && (
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                    className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-800 transition-all text-neutral-500"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {openMenuId === note.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-neutral-900 border border-neutral-800 rounded-lg py-1 shadow-xl z-10">
                      <button
                        onClick={() => openEditModal(note)}
                        className="w-full text-left px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => handleTogglePrivacy(note)}
                        className="w-full text-left px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
                      >
                        {note.isPrivate ? 'Rendi condivisa' : 'Rendi privata'}
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-neutral-800"
                      >
                        Elimina
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Privacy badge */}
              <div className="mb-3">
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                  note.isPrivate
                    ? 'bg-neutral-800 text-neutral-500'
                    : 'bg-emerald-950 text-emerald-400'
                }`}>
                  {note.isPrivate ? 'Privata' : 'Condivisa'}
                </span>
              </div>

              {/* Content */}
              <p className="text-sm text-neutral-300 whitespace-pre-wrap line-clamp-4 mb-4">
                {note.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                <span className="text-xs text-neutral-500">
                  {note.author?.name}
                </span>
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-lg">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-sm font-medium text-neutral-100">
                {editingNote ? 'Modifica nota' : 'Nuova nota'}
              </h2>
            </div>

            <div className="p-4 space-y-4">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Scrivi qui..."
                rows={5}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 resize-none"
                autoFocus
              />

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    checked={newNotePrivate}
                    onChange={() => setNewNotePrivate(true)}
                    className="w-3.5 h-3.5 accent-neutral-100"
                  />
                  <span className="text-sm text-neutral-400">Privata</span>
                </label>
                <label className={`flex items-center gap-2 ${session?.user?.teamId ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                  <input
                    type="radio"
                    name="privacy"
                    checked={!newNotePrivate}
                    onChange={() => setNewNotePrivate(false)}
                    disabled={!session?.user?.teamId}
                    className="w-3.5 h-3.5 accent-neutral-100"
                  />
                  <span className="text-sm text-neutral-400">Condivisa</span>
                </label>
              </div>

              {!session?.user?.teamId && !newNotePrivate && (
                <p className="text-xs text-amber-500">
                  Devi far parte di un team per condividere le note
                </p>
              )}
            </div>

            <div className="p-4 border-t border-neutral-800 flex justify-end gap-3">
              <button
                onClick={() => { setIsModalOpen(false); setEditingNote(null); setNewNoteContent(''); }}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={editingNote ? handleUpdateNote : handleCreateNote}
                disabled={!newNoteContent.trim() || isSubmitting}
                className="px-4 py-2 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
