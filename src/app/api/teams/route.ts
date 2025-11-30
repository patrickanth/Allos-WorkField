import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { teams, users, initializeDefaultTableConfig } from '@/lib/storage';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (session.user.teamId) {
      const team = teams.getById(session.user.teamId);
      if (team) {
        const members = users.getByTeam(team.id);
        return NextResponse.json({ ...team, members });
      }
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json({ error: 'Errore nel recupero del team' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Il nome è obbligatorio' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existingTeam = teams.getBySlug(slug);
    if (existingTeam) {
      return NextResponse.json({ error: 'Un team con questo nome esiste già' }, { status: 400 });
    }

    const newTeam = teams.create({
      name,
      slug,
      description: description || null,
    });

    // Update user to be part of this team with admin role
    users.update(session.user.id, { teamId: newTeam.id, role: 'admin' });

    // Initialize default table config
    initializeDefaultTableConfig(newTeam.id);

    return NextResponse.json(newTeam);
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: 'Errore nella creazione del team' }, { status: 500 });
  }
}
