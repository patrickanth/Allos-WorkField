import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { teams, users } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json({ error: 'Codice invito obbligatorio' }, { status: 400 });
    }

    const team = teams.getByInviteCode(inviteCode.toUpperCase());
    if (!team) {
      return NextResponse.json({ error: 'Codice invito non valido' }, { status: 400 });
    }

    // Update user to be part of this team
    users.update(session.user.id, { teamId: team.id, role: 'member' });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Join team error:', error);
    return NextResponse.json({ error: 'Errore nell\'unirsi al team' }, { status: 500 });
  }
}
