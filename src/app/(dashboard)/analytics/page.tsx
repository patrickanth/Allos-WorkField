'use client';

import { useState, useEffect } from 'react';
// Session removed

interface AnalyticsData {
  overview: {
    totalNotes: number;
    notesThisMonth: number;
    notesGrowth: number;
    totalTickets: number;
    ticketsThisMonth: number;
    ticketsGrowth: number;
    ticketsClosed: number;
    avgResolutionTime: number;
  };
  ticketsByStatus: {
    status: string;
    count: number;
  }[];
  ticketsByPriority: {
    priority: string;
    count: number;
  }[];
  notesByCategory: {
    category: string;
    count: number;
  }[];
  activityByDay: {
    date: string;
    notes: number;
    tickets: number;
  }[];
  topContributors: {
    userId: string;
    name: string;
    notes: number;
    tickets: number;
    ticketsClosed: number;
  }[];
}

export default function AnalyticsPage() {
  const session = { user: { id: 'admin-patrick', name: 'Patrick', email: 'patrickanthonystudio@gmail.com', teamId: 'team-default', role: 'admin' } };
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${timeRange}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-500',
      'in-progress': 'bg-amber-500',
      resolved: 'bg-emerald-500',
      closed: 'bg-zinc-500',
    };
    return colors[status] || 'bg-zinc-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-amber-500',
      low: 'bg-blue-500',
    };
    return colors[priority] || 'bg-zinc-500';
  };

  const formatGrowth = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value}%`;
  };

  // Calculate max value for bar charts
  const maxTicketStatus = analytics?.ticketsByStatus
    ? Math.max(...analytics.ticketsByStatus.map((s) => s.count), 1)
    : 1;
  const maxTicketPriority = analytics?.ticketsByPriority
    ? Math.max(...analytics.ticketsByPriority.map((p) => p.count), 1)
    : 1;
  const maxNoteCategory = analytics?.notesByCategory
    ? Math.max(...analytics.notesByCategory.map((c) => c.count), 1)
    : 1;

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="skeleton h-10 w-48 mb-4" />
          <div className="skeleton h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-20 w-full" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-64 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">Statistiche e metriche del tuo lavoro</p>
          </div>
          <div className="flex rounded-xl overflow-hidden border border-white/[0.06]">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-[13px] font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-white/[0.08] text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {range === 'week' ? 'Settimana' : range === 'month' ? 'Mese' : 'Anno'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-zinc-500 mb-2">Note totali</p>
              <p className="text-3xl font-bold text-white">{analytics?.overview.totalNotes || 0}</p>
              <p className="text-[12px] text-zinc-500 mt-1">
                {analytics?.overview.notesThisMonth || 0} questo mese
              </p>
            </div>
            <div
              className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                (analytics?.overview.notesGrowth || 0) >= 0
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {formatGrowth(analytics?.overview.notesGrowth || 0)}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="w-full bg-zinc-800 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{
                  width: `${Math.min((analytics?.overview.notesThisMonth || 0) / 50 * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-zinc-500 mb-2">Ticket totali</p>
              <p className="text-3xl font-bold text-white">{analytics?.overview.totalTickets || 0}</p>
              <p className="text-[12px] text-zinc-500 mt-1">
                {analytics?.overview.ticketsThisMonth || 0} questo mese
              </p>
            </div>
            <div
              className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                (analytics?.overview.ticketsGrowth || 0) >= 0
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {formatGrowth(analytics?.overview.ticketsGrowth || 0)}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="w-full bg-zinc-800 rounded-full h-1.5">
              <div
                className="bg-amber-500 h-1.5 rounded-full"
                style={{
                  width: `${Math.min((analytics?.overview.ticketsThisMonth || 0) / 30 * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-zinc-500 mb-2">Ticket chiusi</p>
              <p className="text-3xl font-bold text-emerald-400">{analytics?.overview.ticketsClosed || 0}</p>
              <p className="text-[12px] text-zinc-500 mt-1">
                {analytics?.overview.totalTickets
                  ? Math.round((analytics.overview.ticketsClosed / analytics.overview.totalTickets) * 100)
                  : 0}% completamento
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="w-full bg-zinc-800 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{
                  width: `${analytics?.overview.totalTickets ? (analytics.overview.ticketsClosed / analytics.overview.totalTickets) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-zinc-500 mb-2">Tempo medio risoluzione</p>
              <p className="text-3xl font-bold text-white">
                {analytics?.overview.avgResolutionTime || 0}
                <span className="text-lg font-normal text-zinc-500 ml-1">ore</span>
              </p>
              <p className="text-[12px] text-zinc-500 mt-1">per ticket</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <p className="text-[11px] text-zinc-600">
              Obiettivo: 24 ore
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tickets by Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-semibold text-white">Ticket per stato</h3>
            <span className="text-[12px] text-zinc-500">{analytics?.ticketsByStatus?.reduce((sum, s) => sum + s.count, 0) || 0} totali</span>
          </div>
          <div className="space-y-4">
            {analytics?.ticketsByStatus?.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-zinc-400 capitalize">
                    {item.status === 'in-progress' ? 'In corso' : item.status === 'open' ? 'Aperti' : item.status === 'resolved' ? 'Risolti' : 'Chiusi'}
                  </span>
                  <span className="text-[13px] font-medium text-white">{item.count}</span>
                </div>
                <div className="w-full bg-zinc-800/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(item.status)}`}
                    style={{ width: `${(item.count / maxTicketStatus) * 100}%` }}
                  />
                </div>
              </div>
            )) || (
              <p className="text-zinc-500 text-[13px] text-center py-8">Nessun dato disponibile</p>
            )}
          </div>
        </div>

        {/* Tickets by Priority */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-semibold text-white">Ticket per priorità</h3>
            <span className="text-[12px] text-zinc-500">{analytics?.ticketsByPriority?.reduce((sum, p) => sum + p.count, 0) || 0} totali</span>
          </div>
          <div className="space-y-4">
            {analytics?.ticketsByPriority?.map((item) => (
              <div key={item.priority}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-zinc-400 capitalize">
                    {item.priority === 'critical' ? 'Critico' : item.priority === 'high' ? 'Alto' : item.priority === 'medium' ? 'Medio' : 'Basso'}
                  </span>
                  <span className="text-[13px] font-medium text-white">{item.count}</span>
                </div>
                <div className="w-full bg-zinc-800/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getPriorityColor(item.priority)}`}
                    style={{ width: `${(item.count / maxTicketPriority) * 100}%` }}
                  />
                </div>
              </div>
            )) || (
              <p className="text-zinc-500 text-[13px] text-center py-8">Nessun dato disponibile</p>
            )}
          </div>
        </div>

        {/* Notes by Category */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-semibold text-white">Note per categoria</h3>
            <span className="text-[12px] text-zinc-500">{analytics?.notesByCategory?.reduce((sum, c) => sum + c.count, 0) || 0} totali</span>
          </div>
          <div className="space-y-4">
            {analytics?.notesByCategory?.length ? (
              analytics.notesByCategory.map((item, index) => {
                const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] text-zinc-400 capitalize">
                        {item.category || 'Senza categoria'}
                      </span>
                      <span className="text-[13px] font-medium text-white">{item.count}</span>
                    </div>
                    <div className="w-full bg-zinc-800/50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                        style={{ width: `${(item.count / maxNoteCategory) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-zinc-500 text-[13px] text-center py-8">Nessun dato disponibile</p>
            )}
          </div>
        </div>

        {/* Activity Chart (Simplified) */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-semibold text-white">Attività recente</h3>
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-500" />
                <span className="text-zinc-500">Note</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span className="text-zinc-500">Ticket</span>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-2 h-40">
            {analytics?.activityByDay?.slice(-14).map((day, index) => {
              const maxActivity = Math.max(
                ...analytics.activityByDay.map((d) => d.notes + d.tickets),
                1
              );
              const notesHeight = (day.notes / maxActivity) * 100;
              const ticketsHeight = (day.tickets / maxActivity) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col gap-0.5" style={{ height: '120px' }}>
                    <div className="flex-1 flex flex-col justify-end gap-0.5">
                      <div
                        className="w-full bg-indigo-500 rounded-t transition-all duration-300"
                        style={{ height: `${notesHeight}%`, minHeight: day.notes > 0 ? '4px' : '0' }}
                      />
                      <div
                        className="w-full bg-amber-500 rounded-b transition-all duration-300"
                        style={{ height: `${ticketsHeight}%`, minHeight: day.tickets > 0 ? '4px' : '0' }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-zinc-600">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            }) || (
              <p className="text-zinc-500 text-[13px] text-center w-full py-8">Nessun dato disponibile</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Contributors */}
      {analytics?.topContributors && analytics.topContributors.length > 0 && (
        <div className="card">
          <h3 className="text-[15px] font-semibold text-white mb-6">Top contributori</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 px-4 text-[12px] text-zinc-500 font-medium uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-4 text-[12px] text-zinc-500 font-medium uppercase tracking-wider">Membro</th>
                  <th className="text-center py-3 px-4 text-[12px] text-zinc-500 font-medium uppercase tracking-wider">Note</th>
                  <th className="text-center py-3 px-4 text-[12px] text-zinc-500 font-medium uppercase tracking-wider">Ticket</th>
                  <th className="text-center py-3 px-4 text-[12px] text-zinc-500 font-medium uppercase tracking-wider">Chiusi</th>
                  <th className="text-right py-3 px-4 text-[12px] text-zinc-500 font-medium uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {analytics.topContributors.map((contributor, index) => {
                  const score = contributor.notes * 10 + contributor.tickets * 20 + contributor.ticketsClosed * 30;
                  return (
                    <tr key={contributor.userId} className="hover:bg-white/[0.02]">
                      <td className="py-4 px-4">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[12px] font-bold ${
                          index === 0 ? 'bg-amber-500/20 text-amber-400' :
                          index === 1 ? 'bg-zinc-400/20 text-zinc-400' :
                          index === 2 ? 'bg-orange-700/20 text-orange-600' :
                          'bg-zinc-800 text-zinc-500'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar w-9 h-9 rounded-lg text-[13px]">
                            {contributor.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[14px] text-white font-medium">
                            {contributor.name}
                            {contributor.userId === session?.user?.id && (
                              <span className="text-zinc-500 ml-2 text-[12px]">(tu)</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-[14px] text-zinc-300">{contributor.notes}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-[14px] text-zinc-300">{contributor.tickets}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-[14px] text-emerald-400">{contributor.ticketsClosed}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-[14px] font-semibold text-indigo-400">{score}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
