import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { calendarEvents, activityLog } from '@/lib/storage';

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
    const event = calendarEvents.getById(id);

    if (!event) {
      return NextResponse.json({ error: 'Evento non trovato' }, { status: 404 });
    }

    // Check access
    if (event.userId !== session.user.id && event.teamId !== session.user.teamId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Get calendar event error:', error);
    return NextResponse.json({ error: 'Errore nel recupero dell\'evento' }, { status: 500 });
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

    const event = calendarEvents.getById(id);
    if (!event) {
      return NextResponse.json({ error: 'Evento non trovato' }, { status: 404 });
    }

    // Only owner can edit
    if (event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.date !== undefined) updateData.date = new Date(body.date).toISOString();
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate).toISOString() : null;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.isAllDay !== undefined) updateData.isAllDay = body.isAllDay;

    const updated = calendarEvents.update(id, updateData);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update calendar event error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento dell\'evento' }, { status: 500 });
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

    const event = calendarEvents.getById(id);
    if (!event) {
      return NextResponse.json({ error: 'Evento non trovato' }, { status: 404 });
    }

    // Only owner can delete
    if (event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    activityLog.create({
      type: 'event_deleted',
      description: `${session.user.name} ha eliminato l'evento: ${event.title}`,
      userId: session.user.id,
      teamId: session.user.teamId || null,
      metadata: { eventId: id },
    });

    calendarEvents.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione dell\'evento' }, { status: 500 });
  }
}
