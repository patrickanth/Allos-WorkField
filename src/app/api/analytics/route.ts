import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notes, tickets, users, activityLog } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get all data
    const allNotes = session.user.teamId
      ? [...notes.getByUser(session.user.id), ...notes.getByTeam(session.user.teamId)]
      : notes.getByUser(session.user.id);

    const allTickets = session.user.teamId
      ? tickets.getByTeam(session.user.teamId)
      : tickets.getByUser(session.user.id);

    // Remove duplicates (notes that appear in both user and team)
    const uniqueNotes = allNotes.filter((note, index, self) =>
      index === self.findIndex(n => n.id === note.id)
    );

    // Filter by date range
    const notesInRange = uniqueNotes.filter(
      (n) => new Date(n.createdAt) >= startDate
    );
    const ticketsInRange = allTickets.filter(
      (t) => new Date(t.createdAt) >= startDate
    );

    // Previous period for growth calculation
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const notesInPreviousPeriod = uniqueNotes.filter(
      (n) => new Date(n.createdAt) >= previousStartDate && new Date(n.createdAt) < startDate
    );
    const ticketsInPreviousPeriod = allTickets.filter(
      (t) => new Date(t.createdAt) >= previousStartDate && new Date(t.createdAt) < startDate
    );

    // Calculate growth percentages
    const notesGrowth = notesInPreviousPeriod.length > 0
      ? Math.round(((notesInRange.length - notesInPreviousPeriod.length) / notesInPreviousPeriod.length) * 100)
      : notesInRange.length > 0 ? 100 : 0;

    const ticketsGrowth = ticketsInPreviousPeriod.length > 0
      ? Math.round(((ticketsInRange.length - ticketsInPreviousPeriod.length) / ticketsInPreviousPeriod.length) * 100)
      : ticketsInRange.length > 0 ? 100 : 0;

    // Tickets by status
    const ticketsByStatus = ['open', 'in-progress', 'resolved', 'closed'].map((status) => ({
      status,
      count: allTickets.filter((t) => t.status === status).length,
    }));

    // Tickets by priority
    const ticketsByPriority = ['critical', 'high', 'medium', 'low'].map((priority) => ({
      priority,
      count: allTickets.filter((t) => t.priority === priority).length,
    }));

    // Notes by category
    const categoryMap = new Map<string, number>();
    uniqueNotes.forEach((note) => {
      const category = note.category || 'uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    const notesByCategory = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Activity by day (last 14 days)
    const activityByDay: { date: string; notes: number; tickets: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const notesOnDay = uniqueNotes.filter(
        (n) => n.createdAt.split('T')[0] === dateStr
      ).length;
      const ticketsOnDay = allTickets.filter(
        (t) => t.createdAt.split('T')[0] === dateStr
      ).length;

      activityByDay.push({
        date: dateStr,
        notes: notesOnDay,
        tickets: ticketsOnDay,
      });
    }

    // Top contributors (team only)
    let topContributors: {
      userId: string;
      name: string;
      notes: number;
      tickets: number;
      ticketsClosed: number;
    }[] = [];

    if (session.user.teamId) {
      const teamMembers = users.getByTeam(session.user.teamId);
      topContributors = teamMembers
        .map((member) => {
          const memberNotes = uniqueNotes.filter((n) => n.authorId === member.id);
          const memberTickets = allTickets.filter((t) => t.authorId === member.id);
          const memberClosedTickets = allTickets.filter(
            (t) => t.assignedTo === member.id && (t.status === 'closed' || t.status === 'resolved')
          );

          return {
            userId: member.id,
            name: member.name,
            notes: memberNotes.length,
            tickets: memberTickets.length,
            ticketsClosed: memberClosedTickets.length,
          };
        })
        .sort((a, b) => {
          const scoreA = a.notes * 10 + a.tickets * 20 + a.ticketsClosed * 30;
          const scoreB = b.notes * 10 + b.tickets * 20 + b.ticketsClosed * 30;
          return scoreB - scoreA;
        })
        .slice(0, 5);
    }

    // Calculate avg resolution time (mock for now)
    const closedTickets = allTickets.filter((t) => t.status === 'closed' || t.status === 'resolved');
    let avgResolutionTime = 0;
    if (closedTickets.length > 0) {
      const totalHours = closedTickets.reduce((sum, ticket) => {
        const created = new Date(ticket.createdAt).getTime();
        const updated = new Date(ticket.updatedAt).getTime();
        return sum + (updated - created) / (1000 * 60 * 60);
      }, 0);
      avgResolutionTime = Math.round(totalHours / closedTickets.length);
    }

    const analytics = {
      overview: {
        totalNotes: uniqueNotes.length,
        notesThisMonth: notesInRange.length,
        notesGrowth,
        totalTickets: allTickets.length,
        ticketsThisMonth: ticketsInRange.length,
        ticketsGrowth,
        ticketsClosed: closedTickets.length,
        avgResolutionTime,
      },
      ticketsByStatus,
      ticketsByPriority,
      notesByCategory,
      activityByDay,
      topContributors,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json({ error: 'Errore nel recupero delle analytics' }, { status: 500 });
  }
}
