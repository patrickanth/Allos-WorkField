'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenziali non valide');
      } else {
        router.push('/notes');
        router.refresh();
      }
    } catch {
      setError('Si è verificato un errore');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-neutral-900/50 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Allos Branding */}
        <div className="mb-12 text-center">
          {/* Allos - Elegant title */}
          <div className="mb-6">
            <h1
              className="text-5xl font-extralight tracking-[0.35em] text-neutral-200 uppercase"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.35em',
                textIndent: '0.35em',
              }}
            >
              {mounted && 'Allos'.split('').map((letter, i) => (
                <span
                  key={i}
                  className="inline-block"
                  style={{
                    opacity: 0,
                    animation: `fadeIn 0.6s ease forwards`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  {letter}
                </span>
              ))}
            </h1>
          </div>

          {/* WorkField subtitle */}
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-neutral-700" />
            <span className="text-xs tracking-[0.4em] text-neutral-500 uppercase">
              WorkField
            </span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-neutral-700" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900/80 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:bg-neutral-900 transition-all"
              placeholder="nome@azienda.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-900/80 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:bg-neutral-900 transition-all pr-16"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors text-xs uppercase tracking-wider"
              >
                {showPassword ? 'Nascondi' : 'Mostra'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center py-2 bg-red-950/30 rounded-lg border border-red-900/30">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neutral-100 text-neutral-900 font-medium py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                Accesso...
              </span>
            ) : (
              'Accedi'
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-neutral-700 text-xs">
          Contatta l'amministratore per l'accesso
        </p>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
