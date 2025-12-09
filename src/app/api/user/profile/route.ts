import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { users } from '@/lib/storage';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Il nome è obbligatorio' }, { status: 400 });
    }

    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Il nome deve essere di almeno 2 caratteri' }, { status: 400 });
    }

    if (name.trim().length > 50) {
      return NextResponse.json({ error: 'Il nome può essere al massimo 50 caratteri' }, { status: 400 });
    }

    const updated = users.update(session.user.id, { name: name.trim() });

    if (!updated) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true, name: updated.name });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento del profilo' }, { status: 500 });
  }
}
