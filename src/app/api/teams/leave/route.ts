import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { users, teams, activityLog } from '@/lib/storage';

export async function POST() {
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

    // Check if user is admin - admins cannot leave (they would need to delete the team)
    const user = users.getById(session.user.id);
    if (user?.role === 'admin') {
      return NextResponse.json({
        error: 'Gli admin non possono abbandonare il team. Trasferisci i permessi di admin prima.'
      }, { status: 400 });
    }

    // Log activity before leaving
    activityLog.create({
      type: 'member_left',
      description: `${session.user.name} ha abbandonato il team`,
      userId: session.user.id,
      teamId: session.user.teamId,
      metadata: { teamName: team.name },
    });

    // Remove user from team
    users.update(session.user.id, { teamId: null, role: 'member' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leave team error:', error);
    return NextResponse.json({ error: 'Errore nell\'abbandono del team' }, { status: 500 });
  }
}
