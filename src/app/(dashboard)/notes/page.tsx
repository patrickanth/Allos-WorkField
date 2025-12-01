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
    <div className="page">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">{view === 'private' ? 'Note' : 'Note Team'}</h1>
          <p className="page-subtitle">
            {view === 'private'
              ? 'Le tue annotazioni private'
              : canShare
                ? 'Condivise con il tuo team'
                : 'Unisciti a un team per collaborare'
            }
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          + Nuova nota
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cerca nelle note..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input max-w-md"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-4 w-20 mb-4" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="empty-title">{searchQuery ? 'Nessun risultato' : 'Nessuna nota'}</p>
            <p className="empty-text">{searchQuery ? 'Prova a cercare qualcos\'altro' : 'Crea la tua prima nota'}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div key={note.id} className="card p-5 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <span className={`badge ${note.isPrivate ? 'badge-default' : 'badge-green'}`}>
                  {note.isPrivate ? 'Privata' : 'Team'}
                </span>
                {note.authorId === session?.user?.id && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                      className="btn-ghost p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    {openMenuId === note.id && (
                      <div className="dropdown">
                        <button onClick={() => openEditModal(note)} className="dropdown-item">
                          Modifica
                        </button>
                        {canShare && (
                          <button onClick={() => handleTogglePrivacy(note)} className="dropdown-item">
                            {note.isPrivate ? 'Condividi' : 'Rendi privata'}
                          </button>
                        )}
                        <button onClick={() => handleDeleteNote(note.id)} className="dropdown-item dropdown-item-danger">
                          Elimina
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <p className="text-[14px] text-zinc-300 whitespace-pre-wrap line-clamp-4 mb-4 leading-relaxed">
                {note.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="avatar w-6 h-6 rounded text-[10px]">
                    {note.author?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[13px] text-zinc-500">{note.author?.name}</span>
                </div>
                <span className="text-[12px] text-zinc-600">
                  {format(new Date(note.timestamp), 'HH:mm · d MMM', { locale: it })}
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
              <h2 className="modal-title">{editingNote ? 'Modifica nota' : 'Nuova nota'}</h2>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="label">Contenuto</label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Scrivi qui..."
                  className="input"
                  rows={5}
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Visibilità</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewNotePrivate(true)}
                    className={`btn flex-1 ${newNotePrivate ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Privata
                  </button>
                  <button
                    type="button"
                    onClick={() => canShare && setNewNotePrivate(false)}
                    disabled={!canShare}
                    className={`btn flex-1 ${!newNotePrivate ? 'btn-primary' : 'btn-secondary'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Team
                  </button>
                </div>
                {!canShare && (
                  <p className="text-[13px] text-amber-500 mt-2">Unisciti a un team per condividere</p>
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
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
