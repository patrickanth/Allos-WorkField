'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Users, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, teamCode: teamCode || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Errore durante la registrazione');
        return;
      }

      // Auto login after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Registrazione completata. Effettua il login.');
        router.push('/login');
      } else {
        router.push('/notes');
        router.refresh();
      }
    } catch {
      setError('Si è verificato un errore. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-violet-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-lg flex items-center justify-center mx-auto mb-8">
              <Users className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Unisciti alla community
            </h2>
            <p className="text-white/80 max-w-sm mx-auto">
              Crea il tuo account e inizia a collaborare con il tuo team in modo più efficiente.
            </p>

            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Note condivise</p>
                  <p className="text-sm text-white/70">Collabora in tempo reale</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Gestione Team</p>
                  <p className="text-sm text-white/70">Invita colleghi con un codice</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-dark-900 dark:text-white">
              Allos <span className="text-primary-500">WorkField</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
            Crea il tuo account
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mb-8">
            Inizia a lavorare in modo più intelligente
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nome completo"
              type="text"
              placeholder="Mario Rossi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-5 h-5" />}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="nome@azienda.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimo 8 caratteri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-primary-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              required
              minLength={8}
            />

            <Input
              label="Codice Team (opzionale)"
              type="text"
              placeholder="ABC123XY"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              leftIcon={<Users className="w-5 h-5" />}
              hint="Inserisci il codice se vuoi unirti a un team esistente"
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Crea Account
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <p className="mt-8 text-center text-dark-500">
            Hai già un account?{' '}
            <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Accedi
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
