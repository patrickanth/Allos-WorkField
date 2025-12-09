import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notes, tickets, teams, users } from '@/lib/storage';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (!session.user.teamId) {
      return NextResponse.json({ error: 'Non fai parte di un team' }, { status: 400 });
    }

    const team = teams.getById(session.user.teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team non trovato' }, { status: 404 });
    }

    // Get team notes (shared notes)
    const teamNotes = notes.getByTeam(session.user.teamId);

    // Get team tickets
    const teamTickets = tickets.getByTeam(session.user.teamId);

    // Get team members
    const teamMembers = users.getByTeam(session.user.teamId);

    const stats = {
      totalNotes: teamNotes.length,
      totalTickets: teamTickets.length,
      openTickets: teamTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length,
      closedTickets: teamTickets.filter(t => t.status === 'closed' || t.status === 'resolved').length,
      membersCount: teamMembers.length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get team stats error:', error);
    return NextResponse.json({ error: 'Errore nel recupero delle statistiche' }, { status: 500 });
  }
}
