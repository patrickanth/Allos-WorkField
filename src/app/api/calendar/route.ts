import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { calendarEvents, activityLog } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    // Get events for the user and their team
    const events = calendarEvents.getByUserAndTeam(
      session.user.id,
      session.user.teamId
    );

    // Filter by month/year if provided
    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month;
    });

    return NextResponse.json(filteredEvents);
  } catch (error) {
    console.error('Get calendar events error:', error);
    return NextResponse.json({ error: 'Errore nel recupero degli eventi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, date, endDate, type, color, isAllDay } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Titolo e data sono obbligatori' }, { status: 400 });
    }

    const event = calendarEvents.create({
      title,
      description: description || null,
      date: new Date(date).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      type: type || 'event',
      color: color || 'indigo',
      isAllDay: isAllDay ?? true,
      userId: session.user.id,
      teamId: session.user.teamId || null,
      relatedTicketId: null,
    });

    activityLog.create({
      type: 'event_created',
      description: `${session.user.name} ha creato l'evento: ${title}`,
      userId: session.user.id,
      teamId: session.user.teamId || null,
      metadata: { eventId: event.id },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Create calendar event error:', error);
    return NextResponse.json({ error: 'Errore nella creazione dell\'evento' }, { status: 500 });
  }
}
