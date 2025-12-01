'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen relative">
      <div className="px-16 py-14 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16 pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4 font-medium">
            Account
          </p>
          <h1 className="text-5xl font-extralight text-white tracking-tight mb-3">Impostazioni</h1>
          <p className="text-lg text-white/40 font-light">Profilo e preferenze</p>
        </div>

        {/* Profile */}
        <div className="elegant-card mb-10 overflow-hidden">
          <div className="px-10 py-8 border-b border-white/[0.06]">
            <span className="text-sm text-white/40 uppercase tracking-[0.15em] font-medium">Profilo</span>
          </div>
          <div className="p-10">
            <div className="flex items-center gap-6">
              <div className="avatar w-20 h-20 rounded-2xl text-2xl text-white/60">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xl text-white/80 font-light mb-1">{session?.user?.name}</p>
                <p className="text-base text-white/40">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="elegant-card mb-10 overflow-hidden">
          <div className="px-10 py-8 border-b border-white/[0.06]">
            <span className="text-sm text-white/40 uppercase tracking-[0.15em] font-medium">Preferenze</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            <div className="px-10 py-8 flex items-center justify-between">
              <div>
                <p className="text-base text-white/80 mb-1">Tema scuro</p>
                <p className="text-sm text-white/40">Interfaccia con sfondo scuro</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${isDark ? 'bg-white' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 ${isDark ? 'translate-x-7 bg-black' : 'translate-x-1 bg-white/40'}`} />
              </button>
            </div>
            <div className="px-10 py-8 flex items-center justify-between">
              <div>
                <p className="text-base text-white/80 mb-1">Notifiche</p>
                <p className="text-sm text-white/40">Ricevi notifiche dal team</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${notifications ? 'bg-white' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 ${notifications ? 'translate-x-7 bg-black' : 'translate-x-1 bg-white/40'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="elegant-card mb-10 overflow-hidden">
          <div className="px-10 py-8 border-b border-white/[0.06]">
            <span className="text-sm text-white/40 uppercase tracking-[0.15em] font-medium">Sicurezza</span>
          </div>
          <div className="px-10 py-8 flex items-center justify-between">
            <div>
              <p className="text-base text-white/80 mb-1">Password</p>
              <p className="text-sm text-white/40">Modifica la password</p>
            </div>
            <button className="premium-btn px-7 py-3.5 text-base text-white/70">
              Modifica
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="elegant-card overflow-hidden border-red-500/10">
          <div className="px-10 py-8 flex items-center justify-between">
            <div>
              <p className="text-base text-white/80 mb-1">Esci</p>
              <p className="text-sm text-white/40">Disconnetti questa sessione</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-7 py-3.5 text-base text-red-400/80 hover:text-red-400 border border-red-500/20 rounded-2xl hover:bg-red-500/5 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
