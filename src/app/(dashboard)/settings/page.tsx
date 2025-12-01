'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Impostazioni</h1>
        <p className="page-subtitle">Profilo e preferenze</p>
      </div>

      {/* Profile */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
          <span className="text-[12px] text-zinc-500 uppercase tracking-wider font-medium">Profilo</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="avatar w-16 h-16 rounded-xl text-xl">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[16px] text-white font-medium mb-1">{session?.user?.name}</p>
            <p className="text-[14px] text-zinc-500">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card overflow-hidden mb-6">
        <div className="p-6 border-b border-zinc-800">
          <span className="text-[12px] text-zinc-500 uppercase tracking-wider font-medium">Preferenze</span>
        </div>
        <div className="divide-y divide-zinc-800">
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[14px] text-white mb-1">Tema scuro</p>
              <p className="text-[13px] text-zinc-500">Interfaccia con sfondo scuro</p>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`relative w-12 h-7 rounded-full transition-colors ${isDark ? 'bg-white' : 'bg-zinc-700'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full transition-all ${isDark ? 'translate-x-6 bg-zinc-900' : 'translate-x-1 bg-zinc-400'}`} />
            </button>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[14px] text-white mb-1">Notifiche</p>
              <p className="text-[13px] text-zinc-500">Ricevi notifiche dal team</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-12 h-7 rounded-full transition-colors ${notifications ? 'bg-white' : 'bg-zinc-700'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full transition-all ${notifications ? 'translate-x-6 bg-zinc-900' : 'translate-x-1 bg-zinc-400'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card overflow-hidden mb-6">
        <div className="p-6 border-b border-zinc-800">
          <span className="text-[12px] text-zinc-500 uppercase tracking-wider font-medium">Sicurezza</span>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-[14px] text-white mb-1">Password</p>
            <p className="text-[13px] text-zinc-500">Modifica la password</p>
          </div>
          <button className="btn btn-secondary">
            Modifica
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] text-white mb-1">Esci</p>
            <p className="text-[13px] text-zinc-500">Disconnetti questa sessione</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn text-red-400 border-red-500/30 hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
