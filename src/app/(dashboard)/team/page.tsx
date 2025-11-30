'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Crown,
  UserPlus,
  Building2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
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
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDescription || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Errore nella creazione del team');
        return;
      }

      // Update session
      await update({
        teamId: data.id,
        teamName: data.name,
        teamSlug: data.slug,
      });

      setTeam(data);
      setIsCreateModalOpen(false);
      setNewTeamName('');
      setNewTeamDescription('');
      router.refresh();
    } catch (error) {
      console.error('Error creating team:', error);
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

      // Update session
      await update({
        teamId: data.id,
        teamName: data.name,
        teamSlug: data.slug,
      });

      setTeam(data);
      setIsJoinModalOpen(false);
      setJoinCode('');
      fetchTeam();
      router.refresh();
    } catch (error) {
      console.error('Error joining team:', error);
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
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-200 dark:bg-dark-700 rounded w-1/4" />
          <div className="h-64 bg-dark-200 dark:bg-dark-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center py-20"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">
            Unisciti o crea un team
          </h1>
          <p className="text-dark-500 mb-8 max-w-md mx-auto">
            Fai parte di un team per condividere note, gestire ticket e collaborare con i colleghi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-5 h-5" />
              Crea un nuovo team
            </Button>
            <Button size="lg" variant="outline" onClick={() => setIsJoinModalOpen(true)}>
              <UserPlus className="w-5 h-5" />
              Unisciti con un codice
            </Button>
          </div>
        </motion.div>

        {/* Create Team Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => { setIsCreateModalOpen(false); setError(''); }}
          title="Crea un nuovo team"
        >
          <div className="space-y-5">
            <Input
              label="Nome del team"
              placeholder="Es: Development Team"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              required
            />
            <Input
              label="Descrizione (opzionale)"
              placeholder="Una breve descrizione del team"
              value={newTeamDescription}
              onChange={(e) => setNewTeamDescription(e.target.value)}
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setIsCreateModalOpen(false); setError(''); }}>
                Annulla
              </Button>
              <Button
                onClick={handleCreateTeam}
                isLoading={isSubmitting}
                disabled={!newTeamName.trim()}
              >
                Crea Team
              </Button>
            </div>
          </div>
        </Modal>

        {/* Join Team Modal */}
        <Modal
          isOpen={isJoinModalOpen}
          onClose={() => { setIsJoinModalOpen(false); setError(''); }}
          title="Unisciti a un team"
        >
          <div className="space-y-5">
            <p className="text-dark-500">
              Inserisci il codice di invito che ti è stato fornito dal tuo team.
            </p>
            <Input
              label="Codice di invito"
              placeholder="Es: ABC123XY"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setIsJoinModalOpen(false); setError(''); }}>
                Annulla
              </Button>
              <Button
                onClick={handleJoinTeam}
                isLoading={isSubmitting}
                disabled={!joinCode.trim()}
              >
                Unisciti
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Team Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-1">
                  {team.name}
                </h1>
                {team.description && (
                  <p className="text-dark-500 mb-3">{team.description}</p>
                )}
                <div className="flex items-center gap-4">
                  <Badge variant="info">
                    <Users className="w-3 h-3 mr-1" />
                    {team.members?.length || 1} membri
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Invite Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
              Codice di invito
            </h2>
            <p className="text-dark-500 mb-4">
              Condividi questo codice con i colleghi per invitarli nel team.
            </p>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-dark-50 dark:bg-dark-700 rounded-xl px-4 py-3 font-mono text-lg tracking-wider text-dark-900 dark:text-white">
                {team.inviteCode}
              </div>
              <Button onClick={handleCopyCode} variant="secondary">
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-500" />
                    Copiato
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copia
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-6">
              Membri del team
            </h2>

            <div className="space-y-4">
              {team.members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-700/50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={member.name} size="md" />
                    <div>
                      <p className="font-medium text-dark-900 dark:text-white">
                        {member.name}
                        {member.id === session?.user?.id && (
                          <span className="text-primary-500 ml-2">(tu)</span>
                        )}
                      </p>
                      <p className="text-sm text-dark-500">{member.email}</p>
                    </div>
                  </div>
                  {member.role === 'admin' && (
                    <Badge variant="warning">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
