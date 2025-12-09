'use client';

import { useState, useEffect } from 'react';
// Session removed
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Note, Ticket, Activity } from '@/types';
import TutorialModal from '@/components/tutorial/TutorialModal';

interface DashboardStats {
  totalNotes: number;
  privateNotes: number;
  sharedNotes: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  overdueTickets: number;
  upcomingDeadlines: number;
  teamMembers: number;
}

export default function DashboardPage() {
  const session = { user: { id: 'admin-patrick', name: 'Patrick', email: 'patrickanthonystudio@gmail.com', teamId: 'team-default', role: 'admin' } };
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if tutorial should be shown (set by login sequence)
  useEffect(() => {
    const shouldShowTutorial = localStorage.getItem('workfield_show_tutorial');
    if (shouldShowTutorial === 'true') {
      // Small delay to let the dashboard load first
      const timer = setTimeout(() => {
        setShowTutorial(true);
        localStorage.removeItem('workfield_show_tutorial');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, notesRes, ticketsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/notes?type=all&limit=4'),
        fetch('/api/tickets?limit=5'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
        setActivities(statsData.recentActivity || []);
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setRecentNotes(Array.isArray(notesData) ? notesData.slice(0, 4) : []);
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setRecentTickets(Array.isArray(ticketsData) ? ticketsData.slice(0, 5) : []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      open: { label: 'Aperto', class: 'badge-blue' },
      in_progress: { label: 'In Corso', class: 'badge-amber' },
      resolved: { label: 'Risolto', class: 'badge-green' },
      closed: { label: 'Chiuso', class: 'badge-default' },
    };
    return statusMap[status] || statusMap.open;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; class: string }> = {
      low: { label: 'Bassa', class: 'badge-default' },
      medium: { label: 'Media', class: 'badge-blue' },
      high: { label: 'Alta', class: 'badge-amber' },
      critical: { label: 'Critica', class: 'badge-red' },
    };
    return priorityMap[priority] || priorityMap.medium;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      note_created: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      ticket_created: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      ticket_updated: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      member_joined: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    };
    return icons[type] || icons.note_created;
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="skeleton h-10 w-72 mb-4" />
          <div className="skeleton h-5 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton h-4 w-20 mb-3" />
              <div className="skeleton h-10 w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="skeleton h-6 w-32 mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-20 w-full" />
              ))}
            </div>
          </div>
          <div className="card">
            <div className="skeleton h-6 w-32 mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          {getGreeting()}, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="page-subtitle">
          Ecco un riepilogo della tua attivita
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Link href="/notes" className="stat-card group cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="stat-label mb-0">Note Totali</p>
          </div>
          <p className="stat-value">{stats?.totalNotes || 0}</p>
          <p className="text-xs text-zinc-500 mt-2">
            {stats?.privateNotes || 0} private, {stats?.sharedNotes || 0} condivise
          </p>
        </Link>

        <Link href="/tickets" className="stat-card group cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-600 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="stat-label mb-0">Ticket Aperti</p>
          </div>
          <p className="stat-value">{stats?.openTickets || 0}</p>
          <p className="text-xs text-zinc-500 mt-2">
            su {stats?.totalTickets || 0} totali
          </p>
        </Link>

        <div className="stat-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-600 to-orange-600 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="stat-label mb-0">In Corso</p>
          </div>
          <p className="stat-value">{stats?.inProgressTickets || 0}</p>
          <p className="text-xs text-zinc-500 mt-2">
            ticket in lavorazione
          </p>
        </div>

        {stats?.overdueTickets && stats.overdueTickets > 0 ? (
          <Link href="/tickets?filter=overdue" className="stat-card group cursor-pointer relative overflow-hidden border-red-500/30">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-600 to-rose-600 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="stat-label mb-0 text-red-400">In Ritardo</p>
            </div>
            <p className="stat-value text-red-400">{stats.overdueTickets}</p>
            <p className="text-xs text-red-400/70 mt-2">
              richiede attenzione
            </p>
          </Link>
        ) : (
          <Link href="/team" className="stat-card group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-600 to-green-600 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="stat-label mb-0">Team</p>
            </div>
            <p className="stat-value">{stats?.teamMembers || 0}</p>
            <p className="text-xs text-zinc-500 mt-2">
              membri attivi
            </p>
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <Link href="/notes" className="card p-6 flex items-center gap-4 hover:border-indigo-500/30 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Nuova Nota</p>
            <p className="text-xs text-zinc-500">Crea rapidamente</p>
          </div>
        </Link>

        <Link href="/tickets" className="card p-6 flex items-center gap-4 hover:border-blue-500/30 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Nuovo Ticket</p>
            <p className="text-xs text-zinc-500">Apri una richiesta</p>
          </div>
        </Link>

        <Link href="/calendar" className="card p-6 flex items-center gap-4 hover:border-amber-500/30 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Calendario</p>
            <p className="text-xs text-zinc-500">Scadenze e eventi</p>
          </div>
        </Link>

        <Link href="/analytics" className="card p-6 flex items-center gap-4 hover:border-emerald-500/30 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Analytics</p>
            <p className="text-xs text-zinc-500">Statistiche team</p>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Notes */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-semibold text-white">Note Recenti</span>
              </div>
              <Link href="/notes" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Vedi tutte
              </Link>
            </div>
            {recentNotes.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-zinc-500">Nessuna nota recente</p>
                <Link href="/notes" className="btn btn-glow mt-4 text-sm">
                  Crea la prima nota
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {recentNotes.map((note) => (
                  <div key={note.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${note.isPrivate ? 'badge-purple' : 'badge-green'}`}>
                          {note.isPrivate ? 'Privata' : 'Team'}
                        </span>
                        {note.isPinned && (
                          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm2 10v-2a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H8a1 1 0 01-1-1z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-zinc-600">
                        {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true, locale: it })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 line-clamp-2">{note.content}</p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card p-0 overflow-hidden">
          <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-semibold text-white">Attivita Recente</span>
          </div>
          {activities.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-zinc-500">Nessuna attivita recente</p>
            </div>
          ) : (
            <div className="p-4 space-y-1 max-h-[400px] overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-300 truncate">{activity.description}</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: it })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Tickets */}
      {session?.user?.teamId && recentTickets.length > 0 && (
        <div className="mt-8">
          <div className="card p-0 overflow-hidden">
            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span className="text-sm font-semibold text-white">Ticket Recenti</span>
              </div>
              <Link href="/tickets" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Vedi tutti
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Stato</th>
                    <th>Priorita</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((ticket) => {
                    const status = getStatusBadge(ticket.status);
                    const priority = getPriorityBadge(ticket.priority);
                    return (
                      <tr key={ticket.id}>
                        <td>
                          <p className="text-sm text-white font-medium truncate max-w-xs">{ticket.name}</p>
                        </td>
                        <td>
                          <span className={`badge ${status.class}`}>{status.label}</span>
                        </td>
                        <td>
                          <span className={`badge ${priority.class}`}>{priority.label}</span>
                        </td>
                        <td className="text-sm text-zinc-500">
                          {format(new Date(ticket.createdAt), 'd MMM', { locale: it })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}
