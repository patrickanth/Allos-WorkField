import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { tickets, users } from '@/lib/storage';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (!session.user.teamId) {
      return NextResponse.json({ error: 'Devi far parte di un team' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xlsx';

    const teamTickets = tickets.getByTeam(session.user.teamId);

    // Prepare data for export
    const exportData = teamTickets.map(ticket => {
      const author = users.getById(ticket.authorId);
      const assignee = ticket.assigneeId ? users.getById(ticket.assigneeId) : null;

      const baseData: Record<string, unknown> = {
        'Nome Ticket': ticket.name,
        'Descrizione': ticket.description || '',
        'Stato': ticket.status === 'open' ? 'Aperto' : ticket.status === 'in_progress' ? 'In Corso' : ticket.status === 'resolved' ? 'Risolto' : 'Chiuso',
        'Priorità': ticket.priority === 'low' ? 'Bassa' : ticket.priority === 'medium' ? 'Media' : ticket.priority === 'high' ? 'Alta' : 'Critica',
        'Tempo di Reazione (min)': ticket.reactionTime || '',
        'Tempo di Risoluzione (min)': ticket.resolutionTime || '',
        'Autore': author?.name || '',
        'Assegnato a': assignee?.name || '',
        'Data Creazione': new Date(ticket.createdAt).toLocaleDateString('it-IT'),
        'Ultimo Aggiornamento': new Date(ticket.updatedAt).toLocaleDateString('it-IT'),
      };

      // Add custom fields if present
      if (ticket.customFields) {
        try {
          const customFields = JSON.parse(ticket.customFields);
          Object.entries(customFields).forEach(([key, value]) => {
            baseData[key] = value;
          });
        } catch {
          // Ignore parsing errors
        }
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

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Nome Ticket
      { wch: 50 }, // Descrizione
      { wch: 15 }, // Stato
      { wch: 15 }, // Priorità
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
