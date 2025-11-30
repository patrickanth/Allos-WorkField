import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { tickets, users } from '@/lib/storage';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (!session.user.teamId) {
      return NextResponse.json({ error: 'Devi far parte di un team' }, { status: 400 });
    }

    const teamTickets = tickets.getByTeam(session.user.teamId);

    // Add author and assignee info
    const ticketsWithUsers = teamTickets.map(ticket => {
      const author = users.getById(ticket.authorId);
      const assignee = ticket.assigneeId ? users.getById(ticket.assigneeId) : null;

      return {
        ...ticket,
        author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
        assignee: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null,
      };
    });

    // Sort by createdAt desc
    ticketsWithUsers.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(ticketsWithUsers);
  } catch (error) {
    console.error('Get tickets error:', error);
    return NextResponse.json({ error: 'Errore nel recupero dei ticket' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (!session.user.teamId) {
      return NextResponse.json({ error: 'Devi far parte di un team' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, priority, assigneeId, customFields, reactionTime, resolutionTime } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Il nome è obbligatorio' }, { status: 400 });
    }

    const newTicket = tickets.create({
      name: name.trim(),
      description: description?.trim() || null,
      status: 'open',
      priority: priority || 'medium',
      reactionTime: reactionTime || null,
      resolutionTime: resolutionTime || null,
      customFields: customFields ? JSON.stringify(customFields) : null,
      authorId: session.user.id,
      assigneeId: assigneeId || null,
      teamId: session.user.teamId,
    });

    const author = users.getById(session.user.id);
    const assignee = newTicket.assigneeId ? users.getById(newTicket.assigneeId) : null;

    return NextResponse.json({
      ...newTicket,
      author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
      assignee: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Errore nella creazione del ticket' }, { status: 500 });
  }
}
