'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Team, User } from '@/types';

export default function TeamPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [team, setTeam] = useState<(Team & { members?: User[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/teams');
      const data = await res.json();
      setTeam(data);
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
      await update({ teamId: data.id, teamName: data.name, teamSlug: data.slug });
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
      await update({ teamId: data.id, teamName: data.name, teamSlug: data.slug });
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

  const handleCopyCode = () => {
    if (team?.inviteCode) {
      navigator.clipboard.writeText(team.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="skeleton h-10 w-48 mb-4" />
          <div className="skeleton h-5 w-64" />
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
            <p className="empty-text">Crea un nuovo team o unisciti a uno esistente</p>
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

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{team.name}</h1>
        <p className="page-subtitle">Gestione e membri del team</p>
      </div>

      {/* Invite Code Card */}
      <div className="card p-8 lg:p-10 mb-8">
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

      {/* Members */}
      <div className="card overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-white/[0.06]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-zinc-500 uppercase tracking-wider font-semibold">
              Membri del team
            </span>
            <span className="badge badge-purple shrink-0">
              {team.members?.length || 0} {team.members?.length === 1 ? 'membro' : 'membri'}
            </span>
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {team.members?.map((member) => (
            <div key={member.id} className="p-6 lg:p-8 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`avatar w-12 h-12 rounded-xl text-[15px] shrink-0 ${member.role === 'admin' ? 'avatar-glow' : ''}`}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] text-white font-medium truncate">
                    {member.name}
                    {member.id === session?.user?.id && (
                      <span className="text-zinc-500 ml-2 text-[13px]">(tu)</span>
                    )}
                  </p>
                  <p className="text-[13px] text-zinc-500 truncate">{member.email}</p>
                </div>
              </div>
              {member.role === 'admin' && (
                <span className="badge badge-amber shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Admin
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
