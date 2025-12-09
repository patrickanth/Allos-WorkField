import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { activityLog } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get activities for user and team
    const activities = activityLog.getByTeam(session.user.teamId, limit);

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json({ error: 'Errore nel recupero delle attività' }, { status: 500 });
  }
}
