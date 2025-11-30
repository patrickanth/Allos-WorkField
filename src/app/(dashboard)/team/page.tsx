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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-800 rounded w-1/4" />
          <div className="h-40 bg-neutral-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center py-16">
          <h1 className="text-lg font-medium text-neutral-100 mb-2">Nessun team</h1>
          <p className="text-sm text-neutral-500 mb-6">Crea o unisciti a un team per collaborare</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg hover:bg-white transition-colors"
            >
              Crea nuovo team
            </button>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded-lg hover:bg-neutral-900 transition-colors"
            >
              Unisciti con codice
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-sm">
              <div className="p-4 border-b border-neutral-800">
                <h2 className="text-sm font-medium text-neutral-100">Crea team</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Nome</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                    placeholder="Nome del team"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Descrizione</label>
                  <input
                    type="text"
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                    placeholder="Opzionale"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>
              <div className="p-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  onClick={() => { setIsCreateModalOpen(false); setError(''); }}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim() || isSubmitting}
                  className="px-4 py-2 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creazione...' : 'Crea'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Modal */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-sm">
              <div className="p-4 border-b border-neutral-800">
                <h2 className="text-sm font-medium text-neutral-100">Unisciti a un team</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Codice invito</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 font-mono tracking-wider"
                    placeholder="ABC123XY"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>
              <div className="p-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  onClick={() => { setIsJoinModalOpen(false); setError(''); }}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleJoinTeam}
                  disabled={!joinCode.trim() || isSubmitting}
                  className="px-4 py-2 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
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
    <div className="p-6">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-medium text-neutral-100">{team.name}</h1>
          {team.description && <p className="text-sm text-neutral-500 mt-0.5">{team.description}</p>}
        </div>

        {/* Invite Code */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Codice invito</span>
            <button
              onClick={handleCopyCode}
              className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {copied ? 'Copiato' : 'Copia'}
            </button>
          </div>
          <p className="text-lg font-mono tracking-wider text-neutral-100">{team.inviteCode}</p>
        </div>

        {/* Members */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="p-4 border-b border-neutral-800">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Membri ({team.members?.length || 0})
            </span>
          </div>
          <div className="divide-y divide-neutral-800">
            {team.members?.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm text-neutral-400">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-neutral-200">
                      {member.name}
                      {member.id === session?.user?.id && (
                        <span className="text-neutral-500 ml-1">(tu)</span>
                      )}
                    </p>
                    <p className="text-xs text-neutral-500">{member.email}</p>
                  </div>
                </div>
                {member.role === 'admin' && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-400">
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
