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
  const [newTeamDescription, setNewTeamDescription] = useState('');
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
        body: JSON.stringify({ name: newTeamName, description: newTeamDescription || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Errore nella creazione');
        return;
      }
      await update({ teamId: data.id, teamName: data.name, teamSlug: data.slug });
      setTeam(data);
      setIsCreateModalOpen(false);
      setNewTeamName('');
      setNewTeamDescription('');
      router.refresh();
    } catch {
      setError('Si è verificato un errore');
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
      setError('Si è verificato un errore');
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
      <div className="min-h-screen px-16 py-14 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-white/5 rounded w-1/4" />
          <div className="h-48 elegant-card" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-16">
        <div className="text-center">
          <div className="relative mb-10">
            <div className="w-32 h-32 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                <svg className="w-9 h-9 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          </div>
          <h1 className="text-2xl font-light text-white mb-3">Nessun team</h1>
          <p className="text-lg text-white/40 mb-12 font-light">Crea o unisciti a un team per collaborare</p>
          <div className="flex flex-col gap-5 max-w-xs mx-auto">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="primary-btn px-10 py-4 text-base w-full"
            >
              Crea nuovo team
            </button>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="premium-btn px-10 py-4 text-base text-white/70 w-full"
            >
              Unisciti con codice
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-8 z-50">
            <div className="modal-content w-full max-w-lg relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2" />
              <div className="relative">
                <div className="px-10 py-8 border-b border-white/[0.06]">
                  <h2 className="text-2xl font-light text-white tracking-tight">Crea team</h2>
                </div>
                <div className="p-10 space-y-8">
                  <div>
                    <label className="block text-sm text-white/40 uppercase tracking-[0.15em] mb-3 font-medium">Nome</label>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="elegant-input w-full px-6 py-5 text-lg"
                      placeholder="Nome del team"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 uppercase tracking-[0.15em] mb-3 font-medium">Descrizione</label>
                    <input
                      type="text"
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                      className="elegant-input w-full px-6 py-5 text-base"
                      placeholder="Opzionale"
                    />
                  </div>
                  {error && <p className="text-red-400 text-base">{error}</p>}
                </div>
                <div className="px-10 py-8 border-t border-white/[0.06] flex justify-end gap-5">
                  <button
                    onClick={() => { setIsCreateModalOpen(false); setError(''); }}
                    className="px-8 py-4 text-base text-white/40 hover:text-white/70 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleCreateTeam}
                    disabled={!newTeamName.trim() || isSubmitting}
                    className="primary-btn px-10 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creazione...' : 'Crea'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join Modal */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-8 z-50">
            <div className="modal-content w-full max-w-lg relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2" />
              <div className="relative">
                <div className="px-10 py-8 border-b border-white/[0.06]">
                  <h2 className="text-2xl font-light text-white tracking-tight">Unisciti a un team</h2>
                </div>
                <div className="p-10 space-y-8">
                  <div>
                    <label className="block text-sm text-white/40 uppercase tracking-[0.15em] mb-3 font-medium">Codice invito</label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="elegant-input w-full px-6 py-5 text-xl font-mono tracking-[0.2em] text-center"
                      placeholder="ABC123XY"
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-red-400 text-base">{error}</p>}
                </div>
                <div className="px-10 py-8 border-t border-white/[0.06] flex justify-end gap-5">
                  <button
                    onClick={() => { setIsJoinModalOpen(false); setError(''); }}
                    className="px-8 py-4 text-base text-white/40 hover:text-white/70 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleJoinTeam}
                    disabled={!joinCode.trim() || isSubmitting}
                    className="primary-btn px-10 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Accesso...' : 'Unisciti'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="px-16 py-14 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16 pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4 font-medium">
            Il tuo Team
          </p>
          <h1 className="text-5xl font-extralight text-white tracking-tight mb-3">{team.name}</h1>
          {team.description && <p className="text-lg text-white/40 font-light">{team.description}</p>}
        </div>

        {/* Invite Code */}
        <div className="elegant-card p-10 mb-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-white/40 uppercase tracking-[0.15em] font-medium">Codice invito</span>
            <button
              onClick={handleCopyCode}
              className="text-base text-white/40 hover:text-white/70 transition-colors"
            >
              {copied ? 'Copiato!' : 'Copia'}
            </button>
          </div>
          <p className="text-4xl font-mono tracking-[0.3em] text-white font-light">{team.inviteCode}</p>
        </div>

        {/* Members */}
        <div className="elegant-card overflow-hidden">
          <div className="px-10 py-8 border-b border-white/[0.06]">
            <span className="text-sm text-white/40 uppercase tracking-[0.15em] font-medium">
              Membri ({team.members?.length || 0})
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {team.members?.map((member) => (
              <div key={member.id} className="px-10 py-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-5">
                  <div className="avatar w-12 h-12 rounded-xl text-base text-white/50">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base text-white/80 font-light">
                      {member.name}
                      {member.id === session?.user?.id && (
                        <span className="text-white/30 ml-2">(tu)</span>
                      )}
                    </p>
                    <p className="text-sm text-white/40">{member.email}</p>
                  </div>
                </div>
                {member.role === 'admin' && (
                  <span className="status-pill status-progress">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
