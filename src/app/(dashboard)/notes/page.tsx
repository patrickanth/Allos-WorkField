'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Plus,
  Search,
  Lock,
  Globe,
  Clock,
  Trash2,
  Edit3,
  MoreHorizontal,
  Filter,
  StickyNote,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
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
        body: JSON.stringify({
          content: newNoteContent,
          isPrivate: newNotePrivate,
        }),
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
        body: JSON.stringify({
          content: newNoteContent,
          isPrivate: newNotePrivate,
        }),
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
    if (!confirm('Sei sicuro di voler eliminare questa nota?')) return;

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
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
            {view === 'private' ? 'Le mie Note' : 'Note del Team'}
          </h1>
          <p className="text-dark-500 mt-1">
            {view === 'private'
              ? 'Note personali visibili solo a te'
              : 'Note condivise con il team'}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-5 h-5" />
          Nuova Nota
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Cerca nelle note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={view === 'private' ? 'default' : 'info'}>
            <Filter className="w-3 h-3 mr-1" />
            {view === 'private' ? 'Private' : 'Condivise'}
          </Badge>
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-800 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-3/4 mb-4" />
              <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded w-full mb-2" />
              <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center mx-auto mb-4">
            <StickyNote className="w-10 h-10 text-dark-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
            Nessuna nota trovata
          </h3>
          <p className="text-dark-500 mb-6">
            {searchQuery
              ? 'Prova a modificare la ricerca'
              : 'Inizia creando la tua prima nota'}
          </p>
          {!searchQuery && (
            <Button onClick={openCreateModal}>
              <Plus className="w-5 h-5" />
              Crea la prima nota
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="group relative hover:shadow-lg transition-shadow">
                  {/* Menu button */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-dark-100 dark:hover:bg-dark-700 transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4 text-dark-400" />
                    </button>

                    <AnimatePresence>
                      {openMenuId === note.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-dark-100 dark:border-dark-700 py-2 z-10"
                        >
                          {note.authorId === session?.user?.id && (
                            <>
                              <button
                                onClick={() => openEditModal(note)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-700"
                              >
                                <Edit3 className="w-4 h-4" />
                                Modifica
                              </button>
                              <button
                                onClick={() => handleTogglePrivacy(note)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-700"
                              >
                                {note.isPrivate ? (
                                  <>
                                    <Globe className="w-4 h-4" />
                                    Rendi pubblica
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4" />
                                    Rendi privata
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                                Elimina
                              </button>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Note content */}
                  <div className="pr-8">
                    <div className="flex items-center gap-2 mb-3">
                      {note.isPrivate ? (
                        <Badge variant="default" size="sm">
                          <Lock className="w-3 h-3 mr-1" />
                          Privata
                        </Badge>
                      ) : (
                        <Badge variant="info" size="sm">
                          <Globe className="w-3 h-3 mr-1" />
                          Condivisa
                        </Badge>
                      )}
                    </div>

                    <p className="text-dark-700 dark:text-dark-200 whitespace-pre-wrap line-clamp-4 mb-4">
                      {note.content}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-dark-100 dark:border-dark-700">
                      <div className="flex items-center gap-2">
                        <Avatar name={note.author?.name || ''} size="sm" />
                        <span className="text-sm text-dark-500">
                          {note.author?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-dark-400">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(note.timestamp), 'HH:mm', { locale: it })}
                        <span className="mx-1">·</span>
                        {format(new Date(note.timestamp), 'd MMM', { locale: it })}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
          setNewNoteContent('');
        }}
        title={editingNote ? 'Modifica Nota' : 'Nuova Nota'}
        size="lg"
      >
        <div className="space-y-6">
          <Textarea
            placeholder="Scrivi qui la tua nota..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows={6}
            autoFocus
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="privacy"
                checked={newNotePrivate}
                onChange={() => setNewNotePrivate(true)}
                className="w-4 h-4 text-primary-500"
              />
              <Lock className="w-4 h-4 text-dark-400" />
              <span className="text-sm text-dark-700 dark:text-dark-200">Privata</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="privacy"
                checked={!newNotePrivate}
                onChange={() => setNewNotePrivate(false)}
                disabled={!session?.user?.teamId}
                className="w-4 h-4 text-primary-500"
              />
              <Globe className="w-4 h-4 text-dark-400" />
              <span className={`text-sm ${session?.user?.teamId ? 'text-dark-700 dark:text-dark-200' : 'text-dark-400'}`}>
                Condivisa con il team
              </span>
            </label>
          </div>

          {!session?.user?.teamId && !newNotePrivate && (
            <p className="text-sm text-amber-500">
              Devi far parte di un team per condividere le note
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingNote(null);
                setNewNoteContent('');
              }}
            >
              Annulla
            </Button>
            <Button
              onClick={editingNote ? handleUpdateNote : handleCreateNote}
              isLoading={isSubmitting}
              disabled={!newNoteContent.trim()}
            >
              {editingNote ? 'Salva Modifiche' : 'Crea Nota'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
