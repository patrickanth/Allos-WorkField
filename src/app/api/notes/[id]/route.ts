import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notes } from '@/lib/storage';

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

    const updated = notes.update(id, {
      content: body.content,
      isPrivate: body.isPrivate,
      teamId: body.isPrivate === false && session.user.teamId ? session.user.teamId : null,
    });

    return NextResponse.json(updated);
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

    notes.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione della nota' }, { status: 500 });
  }
}
