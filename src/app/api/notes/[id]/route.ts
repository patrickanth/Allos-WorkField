import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notes, users, activityLog } from '@/lib/storage';
import type { NoteColor } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { id } = await params;
    const note = notes.getById(id);

    if (!note) {
      return NextResponse.json({ error: 'Nota non trovata' }, { status: 404 });
    }

    // Check access
    if (note.isPrivate && note.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    if (!note.isPrivate && note.teamId !== session.user.teamId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const author = users.getById(note.authorId);
    return NextResponse.json({
      ...note,
      author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
    });
  } catch (error) {
    console.error('Get note error:', error);
    return NextResponse.json({ error: 'Errore nel recupero della nota' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const note = notes.getById(id);
    if (!note) {
      return NextResponse.json({ error: 'Nota non trovata' }, { status: 404 });
    }

    if (note.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};

    if (body.content !== undefined) updateData.content = body.content;
    if (body.title !== undefined) updateData.title = body.title || null;
    if (body.isPrivate !== undefined) {
      updateData.isPrivate = body.isPrivate;
      updateData.teamId = body.isPrivate === false && session.user.teamId ? session.user.teamId : null;
    }
    if (body.color !== undefined) updateData.color = body.color as NoteColor;
    if (body.category !== undefined) updateData.category = body.category || null;
    if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags.filter(Boolean) : [];
    if (body.isPinned !== undefined) updateData.isPinned = body.isPinned;

    const updated = notes.update(id, updateData);

    // Log activity for significant changes
    if (body.content !== undefined || body.title !== undefined) {
      activityLog.create({
        type: 'note_updated',
        description: `${session.user.name} ha aggiornato una nota${updated?.title ? `: ${updated.title}` : ''}`,
        userId: session.user.id,
        teamId: updated?.teamId || null,
        metadata: { noteId: id },
      });
    }

    const author = users.getById(session.user.id);
    return NextResponse.json({
      ...updated,
      author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
    });
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento della nota' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { id } = await params;

    const note = notes.getById(id);
    if (!note) {
      return NextResponse.json({ error: 'Nota non trovata' }, { status: 404 });
    }

    if (note.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    // Log activity before deleting
    activityLog.create({
      type: 'note_deleted',
      description: `${session.user.name} ha eliminato una nota${note.title ? `: ${note.title}` : ''}`,
      userId: session.user.id,
      teamId: note.teamId || null,
      metadata: { noteId: id },
    });

    notes.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione della nota' }, { status: 500 });
  }
}
