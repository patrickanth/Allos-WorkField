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
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="card p-6">
          <div className="skeleton h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="page">
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="empty-title">Nessun team</p>
            <p className="empty-text mb-4">Crea o unisciti a un team</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                Crea team
              </button>
              <button onClick={() => setIsJoinModalOpen(true)} className="btn btn-secondary">
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
                <h2 className="modal-title">Crea team</h2>
              </div>
              <div className="modal-body">
                <label className="label">Nome del team</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="input"
                  placeholder="Il mio team"
                  autoFocus
                />
                {error && <p className="text-red-400 text-[13px] mt-2">{error}</p>}
              </div>
              <div className="modal-footer">
                <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-ghost">Annulla</button>
                <button onClick={handleCreateTeam} disabled={!newTeamName.trim() || isSubmitting} className="btn btn-primary disabled:opacity-50">
                  {isSubmitting ? 'Creazione...' : 'Crea'}
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
                  className="input font-mono tracking-wider text-center"
                  placeholder="ABC123XY"
                  autoFocus
                />
                {error && <p className="text-red-400 text-[13px] mt-2">{error}</p>}
              </div>
              <div className="modal-footer">
                <button onClick={() => setIsJoinModalOpen(false)} className="btn btn-ghost">Annulla</button>
                <button onClick={handleJoinTeam} disabled={!joinCode.trim() || isSubmitting} className="btn btn-primary disabled:opacity-50">
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
        <p className="page-subtitle">Gestione del team</p>
      </div>

      {/* Invite Code */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] text-zinc-500 uppercase tracking-wider font-medium">Codice invito</span>
          <button onClick={handleCopyCode} className="btn btn-ghost text-[13px]">
            {copied ? 'Copiato!' : 'Copia'}
          </button>
        </div>
        <p className="text-2xl font-mono tracking-[0.2em] text-white">{team.inviteCode}</p>
      </div>

      {/* Members */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <span className="text-[12px] text-zinc-500 uppercase tracking-wider font-medium">
            Membri ({team.members?.length || 0})
          </span>
        </div>
        <div className="divide-y divide-zinc-800">
          {team.members?.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="avatar w-9 h-9 rounded-lg text-[13px]">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[14px] text-white">
                    {member.name}
                    {member.id === session?.user?.id && <span className="text-zinc-500 ml-1">(tu)</span>}
                  </p>
                  <p className="text-[12px] text-zinc-500">{member.email}</p>
                </div>
              </div>
              {member.role === 'admin' && (
                <span className="badge badge-amber">Admin</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
