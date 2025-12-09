'use client';

import { useState, useEffect } from 'react';
// Session removed
import { useRouter } from 'next/navigation';
import type { Team, User, Activity } from '@/types';

interface TeamStats {
  totalNotes: number;
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  membersCount: number;
}

interface TeamMember extends User {
  stats?: {
    notes: number;
    tickets: number;
    ticketsCompleted: number;
  };
  lastActive?: string;
}

export default function TeamPage() {
  const session = { user: { id: 'admin-patrick', name: 'Patrick', email: 'patrickanthonystudio@gmail.com', teamId: 'team-default', role: 'admin' } }; const update = () => {};
  const router = useRouter();
  const [team, setTeam] = useState<(Team & { members?: TeamMember[] }) | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'activity'>('members');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const [teamRes, activitiesRes] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/activities?limit=20')
      ]);

      const teamData = await teamRes.json();
      setTeam(teamData);

      if (teamData && teamData.id) {
        // Fetch team stats
        const statsRes = await fetch('/api/teams/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setTeamStats(statsData);
        }
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Errore');
        return;
      }
      setTeam(data);
      setIsCreateModalOpen(false);
      setNewTeamName('');
      router.refresh();
    } catch {
      setError('Errore');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Codice non valido');
        return;
      }
      setTeam(data);
      setIsJoinModalOpen(false);
      setJoinCode('');
      fetchTeam();
      router.refresh();
    } catch {
      setError('Errore');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveTeam = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/teams/leave', {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Errore');
        return;
      }
      setTeam(null);
      setTeamStats(null);
      setIsLeaveModalOpen(false);
      router.refresh();
    } catch {
      setError('Errore');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (team?.inviteCode) {
      navigator.clipboard.writeText(team.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note_created':
      case 'note_updated':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'ticket_created':
      case 'ticket_updated':
      case 'ticket_closed':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        );
      case 'member_joined':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

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
              <div className="skeleton h-16 w-full" />
            </div>
          ))}
        </div>
        <div className="card p-8">
          <div className="skeleton h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">Collabora con il tuo team</p>
        </div>

        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="empty-title">Non fai parte di nessun team</p>
            <p className="empty-text">Crea un nuovo team o unisciti a uno esistente per collaborare</p>
            <div className="flex gap-4 justify-center mt-8">
              <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crea team
              </button>
              <button onClick={() => setIsJoinModalOpen(true)} className="btn btn-secondary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Unisciti
              </button>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Crea un nuovo team</h2>
              </div>
              <div className="modal-body">
                <label className="label">Nome del team</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="input"
                  placeholder="Il mio fantastico team"
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-[13px] mt-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-ghost">Annulla</button>
                <button onClick={handleCreateTeam} disabled={!newTeamName.trim() || isSubmitting} className="btn btn-primary disabled:opacity-40">
                  {isSubmitting ? 'Creazione...' : 'Crea team'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Modal */}
        {isJoinModalOpen && (
          <div className="modal-overlay" onClick={() => setIsJoinModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Unisciti a un team</h2>
              </div>
              <div className="modal-body">
                <label className="label">Codice invito</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="input font-mono tracking-[0.3em] text-center text-lg"
                  placeholder="ABC123XY"
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-[13px] mt-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button onClick={() => setIsJoinModalOpen(false)} className="btn btn-ghost">Annulla</button>
                <button onClick={handleJoinTeam} disabled={!joinCode.trim() || isSubmitting} className="btn btn-primary disabled:opacity-40">
                  {isSubmitting ? 'Accesso...' : 'Unisciti'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isAdmin = team.members?.find(m => m.id === session?.user?.id)?.role === 'admin';

  return (
    <div className="page">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">{team.name}</h1>
            <p className="page-subtitle">Gestione e membri del team</p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="btn btn-ghost text-red-400 hover:bg-red-500/10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Abbandona team
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{teamStats?.membersCount || team.members?.length || 0}</p>
              <p className="text-[13px] text-zinc-500">Membri</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{teamStats?.totalNotes || 0}</p>
              <p className="text-[13px] text-zinc-500">Note condivise</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{teamStats?.openTickets || 0}</p>
              <p className="text-[13px] text-zinc-500">Ticket aperti</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{teamStats?.closedTickets || 0}</p>
              <p className="text-[13px] text-zinc-500">Ticket chiusi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Code Card */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-[13px] text-zinc-500 uppercase tracking-wider font-semibold mb-3">Codice Invito</p>
            <p className="text-2xl sm:text-3xl font-mono tracking-[0.2em] sm:tracking-[0.3em] text-white font-bold">{team.inviteCode}</p>
            <p className="text-[13px] text-zinc-500 mt-3">Condividi questo codice per invitare nuovi membri</p>
          </div>
          <button
            onClick={handleCopyCode}
            className={`btn ${copied ? 'btn-glow' : 'btn-secondary'} shrink-0 self-start sm:self-auto`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copiato!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Copia codice</span>
                <span className="sm:hidden">Copia</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="border-b border-white/[0.06]">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-8 py-5 text-[14px] font-medium transition-colors relative ${
                activeTab === 'members'
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Membri ({team.members?.length || 0})
              {activeTab === 'members' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-8 py-5 text-[14px] font-medium transition-colors relative ${
                activeTab === 'activity'
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Attività recente
              {activeTab === 'activity' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'members' && (
          <div className="divide-y divide-white/[0.04]">
            {(team.members as TeamMember[] | undefined)?.map((member) => (
              <div key={member.id} className="p-6 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`avatar w-12 h-12 rounded-xl text-[15px] shrink-0 ${member.role === 'admin' ? 'avatar-glow' : ''}`}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="text-[15px] text-white font-medium truncate">
                        {member.name}
                        {member.id === session?.user?.id && (
                          <span className="text-zinc-500 ml-2 text-[13px]">(tu)</span>
                        )}
                      </p>
                      {member.role === 'admin' && (
                        <span className="badge badge-amber shrink-0 text-[11px]">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-zinc-500 truncate">{member.email}</p>
                  </div>
                </div>
                {member.stats && (
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">{member.stats.notes}</p>
                      <p className="text-[11px] text-zinc-500">Note</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">{member.stats.tickets}</p>
                      <p className="text-[11px] text-zinc-500">Ticket</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-emerald-400">{member.stats.ticketsCompleted}</p>
                      <p className="text-[11px] text-zinc-500">Completati</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="divide-y divide-white/[0.04]">
            {activities.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-zinc-500 text-[14px]">Nessuna attività recente</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="p-5 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-zinc-300 leading-relaxed">{activity.description}</p>
                    <p className="text-[12px] text-zinc-600 mt-1">{formatTimeAgo(activity.createdAt.toString())}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Leave Team Modal */}
      {isLeaveModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLeaveModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Abbandona il team</h2>
            </div>
            <div className="modal-body">
              <p className="text-zinc-400 text-[14px]">
                Sei sicuro di voler abbandonare il team <strong className="text-white">{team.name}</strong>?
              </p>
              <p className="text-zinc-500 text-[13px] mt-3">
                Perderai l'accesso a tutte le note e i ticket condivisi del team.
              </p>
              {error && (
                <p className="text-red-400 text-[13px] mt-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsLeaveModalOpen(false)} className="btn btn-ghost">Annulla</button>
              <button
                onClick={handleLeaveTeam}
                disabled={isSubmitting}
                className="btn bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-40"
              >
                {isSubmitting ? 'Uscita...' : 'Abbandona'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
