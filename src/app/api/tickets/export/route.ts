import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tickets, users, clients } from '@/lib/firebase';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (!session.user.teamId) {
      return NextResponse.json({ error: 'Devi far parte di un team' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xlsx';

    const teamTickets = await tickets.getByTeam(session.user.teamId);
    const allClients = await clients.getByTeam(session.user.teamId);
    const allUsers = await users.getByTeam(session.user.teamId);

    // Create lookup maps for better performance
    const clientsMap = new Map(allClients.map(c => [c.id, c]));
    const usersMap = new Map(allUsers.map(u => [u.id, u]));

    // Prepare data for export with all fields
    const exportData = teamTickets.map(ticket => {
      const author = usersMap.get(ticket.authorId);
      const assignee = ticket.assigneeId ? usersMap.get(ticket.assigneeId) : null;
      const client = ticket.clientId ? clientsMap.get(ticket.clientId) : null;

      const statusLabels = {
        open: 'Aperto',
        in_progress: 'In Corso',
        resolved: 'Risolto',
        closed: 'Chiuso',
      };

      const priorityLabels = {
        low: 'Bassa',
        medium: 'Media',
        high: 'Alta',
        critical: 'Critica',
      };

      const baseData: Record<string, unknown> = {
        'Nome Ticket': ticket.name,
        'Descrizione': ticket.description || '',
        'Cliente': client?.name || '',
        'Categoria': ticket.category || '',
        'Tags': ticket.tags && ticket.tags.length > 0 ? ticket.tags.join(', ') : '',
        'Stato': statusLabels[ticket.status] || ticket.status,
        'Priorità': priorityLabels[ticket.priority] || ticket.priority,
        'Data Scadenza': ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString('it-IT') : '',
        'Tempo di Reazione (min)': ticket.reactionTime || '',
        'Tempo di Risoluzione (min)': ticket.resolutionTime || '',
        'Autore': author?.name || '',
        'Assegnato a': assignee?.name || '',
        'Data Creazione': new Date(ticket.createdAt).toLocaleDateString('it-IT'),
        'Ultimo Aggiornamento': new Date(ticket.updatedAt).toLocaleDateString('it-IT'),
      };

      // Add custom fields if present
      if (ticket.customFields) {
        Object.entries(ticket.customFields).forEach(([key, value]) => {
          baseData[key] = value;
        });
      }

      return baseData;
    });

    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      // Generate CSV
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="tickets_${dateStr}.csv"`,
        },
      });
    }

    // Create workbook for Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths (updated to include new fields)
    const colWidths = [
      { wch: 30 }, // Nome Ticket
      { wch: 50 }, // Descrizione
      { wch: 20 }, // Cliente
      { wch: 20 }, // Categoria
      { wch: 30 }, // Tags
      { wch: 15 }, // Stato
      { wch: 15 }, // Priorità
      { wch: 15 }, // Data Scadenza
      { wch: 20 }, // Tempo di Reazione
      { wch: 20 }, // Tempo di Risoluzione
      { wch: 20 }, // Autore
      { wch: 20 }, // Assegnato a
      { wch: 15 }, // Data Creazione
      { wch: 15 }, // Ultimo Aggiornamento
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as file download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="tickets_${dateStr}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export tickets error:', error);
    return NextResponse.json({ error: 'Errore nell\'esportazione' }, { status: 500 });
  }
}
