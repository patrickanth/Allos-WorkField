import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { users } from '@/lib/firebase';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamMembers = await users.getByTeam(session.user.teamId);

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
