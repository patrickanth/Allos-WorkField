import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notes, users, activityLog } from '@/lib/storage';
import type { NoteColor } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'private' | 'shared' | 'all'
    const limit = searchParams.get('limit');

    let result: ReturnType<typeof notes.getAll> = [];

    if (type === 'private') {
      result = notes.getPrivateByAuthor(session.user.id);
    } else if (type === 'shared' && session.user.teamId) {
      result = notes.getSharedByTeam(session.user.teamId);
    } else {
      // Get all notes for current user (private + shared from team)
      const privateNotes = notes.getPrivateByAuthor(session.user.id);
      const sharedNotes = session.user.teamId
        ? notes.getSharedByTeam(session.user.teamId)
        : [];
      result = [...privateNotes, ...sharedNotes];
    }

    // Add author info
    const notesWithAuthors = result.map(note => {
      const author = users.getById(note.authorId);
      return {
        ...note,
        author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
      };
    });

    // Sort: pinned first, then by timestamp desc
    notesWithAuthors.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Apply limit if specified
    if (limit) {
      return NextResponse.json(notesWithAuthors.slice(0, parseInt(limit)));
    }

    return NextResponse.json(notesWithAuthors);
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json({ error: 'Errore nel recupero delle note' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { content, title, isPrivate, color, category, tags } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Il contenuto e obbligatorio' }, { status: 400 });
    }

    const newNote = notes.create({
      content: content.trim(),
      title: title?.trim() || undefined,
      isPrivate: isPrivate ?? true,
      color: (color as NoteColor) || 'default',
      category: category?.trim() || undefined,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      authorId: session.user.id,
      teamId: !isPrivate && session.user.teamId ? session.user.teamId : null,
    });

    // Log activity
    activityLog.create({
      type: 'note_created',
      description: `${session.user.name} ha creato una nuova nota${newNote.title ? `: ${newNote.title}` : ''}`,
      userId: session.user.id,
      teamId: !isPrivate && session.user.teamId ? session.user.teamId : null,
      metadata: { noteId: newNote.id },
    });

    const author = users.getById(session.user.id);

    return NextResponse.json({
      ...newNote,
      author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
    });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json({ error: 'Errore nella creazione della nota' }, { status: 500 });
  }
}
