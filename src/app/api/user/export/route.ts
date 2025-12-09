import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { users, notes, tickets, calendarEvents } from '@/lib/storage';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const user = users.getById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    // Get all user data
    const userNotes = notes.getByUser(session.user.id);
    const userTickets = tickets.getByUser(session.user.id);
    const userEvents = calendarEvents.getByUserAndTeam(session.user.id, null);

    // Prepare export data (excluding sensitive info)
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        teamId: user.teamId,
        role: user.role,
      },
      notes: userNotes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        isPrivate: note.isPrivate,
        isPinned: note.isPinned,
        color: note.color,
        category: note.category,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
      tickets: userTickets.map((ticket) => ({
        id: ticket.id,
        name: ticket.name,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        tags: ticket.tags,
        dueDate: ticket.dueDate,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      })),
      events: userEvents.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        endDate: event.endDate,
        type: event.type,
        color: event.color,
        isAllDay: event.isAllDay,
        createdAt: event.createdAt,
      })),
      statistics: {
        totalNotes: userNotes.length,
        totalTickets: userTickets.length,
        totalEvents: userEvents.length,
      },
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="allos-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Export data error:', error);
    return NextResponse.json({ error: 'Errore nell\'esportazione dei dati' }, { status: 500 });
  }
}
