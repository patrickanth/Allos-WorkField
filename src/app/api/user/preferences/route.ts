import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { users } from '@/lib/storage';

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

    // Return preferences or defaults
    const preferences = user.preferences || {
      theme: 'dark',
      notifications: true,
      emailNotifications: false,
      soundEnabled: true,
      language: 'it',
    };

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: 'Errore nel recupero delle preferenze' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { theme, notifications, emailNotifications, soundEnabled, language } = body;

    const preferences = {
      theme: theme || 'dark',
      notifications: notifications ?? true,
      emailNotifications: emailNotifications ?? false,
      soundEnabled: soundEnabled ?? true,
      language: language || 'it',
    };

    users.update(session.user.id, { preferences });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento delle preferenze' }, { status: 500 });
  }
}
