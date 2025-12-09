'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Note, NoteColor } from '@/types';

const colorOptions: { value: NoteColor; label: string; bg: string; border: string }[] = [
  { value: 'default', label: 'Default', bg: 'bg-zinc-800/50', border: 'border-zinc-700/50' },
  { value: 'red', label: 'Rosso', bg: 'bg-red-950/30', border: 'border-red-800/30' },
  { value: 'orange', label: 'Arancione', bg: 'bg-orange-950/30', border: 'border-orange-800/30' },
  { value: 'yellow', label: 'Giallo', bg: 'bg-yellow-950/30', border: 'border-yellow-800/30' },
  { value: 'green', label: 'Verde', bg: 'bg-emerald-950/30', border: 'border-emerald-800/30' },
  { value: 'blue', label: 'Blu', bg: 'bg-blue-950/30', border: 'border-blue-800/30' },
  { value: 'purple', label: 'Viola', bg: 'bg-purple-950/30', border: 'border-purple-800/30' },
  { value: 'pink', label: 'Rosa', bg: 'bg-pink-950/30', border: 'border-pink-800/30' },
];

const getColorClasses = (color: NoteColor) => {
  const found = colorOptions.find(c => c.value === color);
  return found || colorOptions[0];
};

type NoteWithAuthor = Note & { author?: { id: string; name: string; avatar: string | null } };

export default function NotesPage() {
  const searchParams = useSearchParams();
  // Hardcoded session
  const session = { user: { id: 'admin-patrick', name: 'Patrick', teamId: 'team-default' } };
  const view = searchParams.get('view') || 'private';

  const [notes, setNotes] = useState<NoteWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<NoteColor | 'all'>('all');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPrivate: view === 'private',
    color: 'default' as NoteColor,
    category: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Categories from notes
  const categories = useMemo(() => {
    const cats = new Set(notes.map(n => n.category).filter(Boolean) as string[]);
    return Array.from(cats);
  }, [notes]);

  useEffect(() => {
    fetchNotes();
  }, [view]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, isPrivate: view === 'private' }));
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
    if (!formData.content.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title || null,
          content: formData.content,
          isPrivate: formData.isPrivate,
          color: formData.color,
          category: formData.category || null,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const newNote = await res.json();
        if ((view === 'private' && newNote.isPrivate) || (view === 'shared' && !newNote.isPrivate)) {
          setNotes([newNote, ...notes]);
        }
        resetForm();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !formData.content.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title || null,
          content: formData.content,
          isPrivate: formData.isPrivate,
          color: formData.color,
          category: formData.category || null,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const updatedNote = await res.json();
        setNotes(notes.map(n => n.id === updatedNote.id ? { ...n, ...updatedNote } : n));
        resetForm();
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

  const handleTogglePin = async (note: Note) => {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      if (res.ok) {
        const updated = await res.json();
        setNotes(notes.map(n => n.id === updated.id ? { ...n, ...updated } : n));
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
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
    setFormData({
      title: note.title || '',
      content: note.content || '',
      isPrivate: note.isPrivate,
      color: note.color || 'default',
      category: note.category || '',
      tags: (note.tags || []).join(', '),
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      isPrivate: view === 'private',
      color: 'default',
      category: '',
      tags: '',
    });
  };

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note =>
        (note.content || '').toLowerCase().includes(query) ||
        (note.title || '').toLowerCase().includes(query) ||
        (note.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(note => note.category === selectedCategory);
    }

    // Color filter
    if (selectedColor !== 'all') {
      result = result.filter(note => note.color === selectedColor);
    }

    // Pinned only
    if (showPinnedOnly) {
      result = result.filter(note => note.isPinned);
    }

    // Sort
    result.sort((a, b) => {
      // Pinned always first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return result;
  }, [notes, searchQuery, selectedCategory, selectedColor, showPinnedOnly, sortBy]);

  const canShare = session?.user?.teamId;
  const pinnedCount = notes.filter(n => n.isPinned).length;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
        <button onClick={openCreateModal} className="btn btn-primary shrink-0 self-start">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nuova nota</span>
          <span className="sm:hidden">Nuova</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-lg">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cerca nelle note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-14"
            />
          </div>

          {/* Filter toggles */}
          <div className="flex items-center gap-3 flex-wrap">
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input py-3 px-4 min-w-[140px]"
              >
                <option value="all">Tutte le categorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value as NoteColor | 'all')}
              className="input py-3 px-4 min-w-[120px]"
            >
              <option value="all">Tutti i colori</option>
              {colorOptions.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`btn ${showPinnedOnly ? 'btn-glow' : 'btn-secondary'} py-3`}
            >
              <svg className="w-4 h-4" fill={showPinnedOnly ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="hidden sm:inline">Fissate ({pinnedCount})</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
              className="input py-3 px-4 min-w-[130px]"
            >
              <option value="date">Per data</option>
              <option value="title">Per titolo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const colorClasses = getColorClasses(note.color || 'default');
            return (
              <div
                key={note.id}
                className={`card group relative ${colorClasses.bg} ${colorClasses.border} border transition-all hover:scale-[1.02]`}
              >
                {/* Pin indicator */}
                {note.isPinned && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
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
                    {note.category && (
                      <span className="badge badge-default text-xs">{note.category}</span>
                    )}
                  </div>

                  {note.authorId === session?.user?.id && (
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                        className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {openMenuId === note.id && (
                        <div className="dropdown z-50">
                          <button onClick={() => handleTogglePin(note)} className="dropdown-item">
                            <span className="flex items-center gap-3">
                              <svg className="w-4 h-4" fill={note.isPinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                              {note.isPinned ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                            </span>
                          </button>
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

                {/* Title */}
                {note.title && (
                  <h3 className="text-lg font-semibold text-white mb-3 line-clamp-1">{note.title}</h3>
                )}

                {/* Content */}
                <p className="text-[15px] text-zinc-300 whitespace-pre-wrap line-clamp-4 mb-6 leading-relaxed">
                  {note.content}
                </p>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-6">
                    {note.tags.map((tag) => (
                      <span key={tag} className="text-xs text-zinc-500 bg-white/[0.05] px-2.5 py-1 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="avatar w-8 h-8 rounded-lg text-[12px] shrink-0">
                      {note.author?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[14px] text-zinc-400 font-medium truncate">{note.author?.name}</span>
                  </div>
                  <span className="text-[12px] text-zinc-600 shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true, locale: it })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingNote ? 'Modifica nota' : 'Crea nuova nota'}</h2>
            </div>
            <div className="modal-body space-y-6">
              {/* Title */}
              <div>
                <label className="label">Titolo (opzionale)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Dai un titolo alla tua nota..."
                  className="input"
                />
              </div>

              {/* Content */}
              <div>
                <label className="label">Contenuto</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Scrivi qui la tua nota..."
                  className="input"
                  rows={6}
                  autoFocus
                />
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Categoria</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Es: Lavoro, Personale..."
                    className="input"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
                <div>
                  <label className="label">Tags (separati da virgola)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Es: importante, urgente..."
                    className="input"
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="label">Colore</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-10 h-10 rounded-xl ${color.bg} ${color.border} border-2 transition-all ${
                        formData.color === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="label">Visibilita</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPrivate: true })}
                    className={`btn flex-1 ${formData.isPrivate ? 'btn-glow' : 'btn-secondary'}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Privata
                  </button>
                  <button
                    type="button"
                    onClick={() => canShare && setFormData({ ...formData, isPrivate: false })}
                    disabled={!canShare}
                    className={`btn flex-1 ${!formData.isPrivate ? 'btn-glow' : 'btn-secondary'} disabled:opacity-40 disabled:cursor-not-allowed`}
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
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="btn btn-ghost">
                Annulla
              </button>
              <button
                onClick={editingNote ? handleUpdateNote : handleCreateNote}
                disabled={!formData.content.trim() || isSubmitting}
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
