import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { tickets, users } from '@/lib/storage';

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

    const ticket = tickets.getById(id);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trovato' }, { status: 404 });
    }

    if (ticket.teamId !== session.user.teamId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.reactionTime !== undefined) updateData.reactionTime = body.reactionTime;
    if (body.resolutionTime !== undefined) updateData.resolutionTime = body.resolutionTime;
    if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId;
    if (body.customFields !== undefined) updateData.customFields = JSON.stringify(body.customFields);

    const updated = tickets.update(id, updateData as Parameters<typeof tickets.update>[1]);

    if (!updated) {
      return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
    }

    const author = users.getById(updated.authorId);
    const assignee = updated.assigneeId ? users.getById(updated.assigneeId) : null;

    return NextResponse.json({
      ...updated,
      author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
      assignee: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null,
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento del ticket' }, { status: 500 });
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

    const ticket = tickets.getById(id);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trovato' }, { status: 404 });
    }

    if (ticket.teamId !== session.user.teamId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    // Only admin or author can delete
    if (session.user.role !== 'admin' && ticket.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    tickets.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete ticket error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione del ticket' }, { status: 500 });
  }
}
