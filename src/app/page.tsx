'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Se già loggato, vai direttamente alla dashboard
    if (status === 'authenticated') {
      router.push('/notes');
    }
  }, [status, router]);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-sky-400/50" />
        </motion.div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(135, 206, 235, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(135, 206, 235, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-[120px]" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-sky-400/20"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, Math.random() * -200],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="relative">
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 40px rgba(56, 189, 248, 0.1)',
                  '0 0 80px rgba(56, 189, 248, 0.2)',
                  '0 0 40px rgba(56, 189, 248, 0.1)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-400/20 to-sky-600/20 backdrop-blur-sm border border-sky-500/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-sky-400" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-light text-white/90 tracking-[0.2em] uppercase mb-4">
            Allos
          </h1>
          <p className="text-sky-400/40 text-xs tracking-[0.4em] uppercase">
            WorkField
          </p>
        </motion.div>

        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center gap-8"
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative px-8 py-3 text-white/60 text-xs tracking-[0.3em] uppercase transition-colors hover:text-white/90 group"
            >
              <span className="relative z-10">Accedi</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent group-hover:w-full transition-all duration-300" />
            </motion.button>
          </Link>

          <span className="text-sky-400/20 text-[8px]">·</span>

          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative px-8 py-3 text-white/60 text-xs tracking-[0.3em] uppercase transition-colors hover:text-white/90 group"
            >
              <span className="relative z-10">Registrati</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent group-hover:w-full transition-all duration-300" />
            </motion.button>
          </Link>
        </motion.nav>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 text-white/10 text-[10px] tracking-[0.3em] uppercase"
        >
          Collaborative Workspace
        </motion.p>
      </div>
    </div>
  );
}
