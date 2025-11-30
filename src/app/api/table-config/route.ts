import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { tableConfigs, initializeDefaultTableConfig } from '@/lib/storage';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (!session.user.teamId) {
      return NextResponse.json({ error: 'Devi far parte di un team' }, { status: 400 });
    }

    let config = tableConfigs.getDefaultByTeam(session.user.teamId);

    // Initialize default config if not exists
    if (!config) {
      config = initializeDefaultTableConfig(session.user.teamId);
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Get table config error:', error);
    return NextResponse.json({ error: 'Errore nel recupero della configurazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (!session.user.teamId) {
      return NextResponse.json({ error: 'Devi far parte di un team' }, { status: 400 });
    }

    // Only admin can update table config
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Solo gli admin possono modificare la configurazione' }, { status: 403 });
    }

    const body = await request.json();
    const { columns, name } = body;

    let config = tableConfigs.getDefaultByTeam(session.user.teamId);

    if (config) {
      const updated = tableConfigs.update(config.id, {
        columns: columns || config.columns,
        name: name || config.name,
      });
      return NextResponse.json(updated);
    } else {
      config = tableConfigs.create({
        name: name || 'Configurazione Default',
        columns: columns || [],
        teamId: session.user.teamId,
        isDefault: true,
      });
      return NextResponse.json(config);
    }
  } catch (error) {
    console.error('Update table config error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento della configurazione' }, { status: 500 });
  }
}
