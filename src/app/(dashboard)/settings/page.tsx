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
    <div className="p-6">
      <div className="max-w-xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-medium text-neutral-100">Impostazioni</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Profilo e preferenze</p>
        </div>

        {/* Profile */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg mb-6">
          <div className="p-4 border-b border-neutral-800">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Profilo</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-lg text-neutral-400">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-neutral-200">{session?.user?.name}</p>
                <p className="text-xs text-neutral-500">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg mb-6">
          <div className="p-4 border-b border-neutral-800">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Preferenze</span>
          </div>
          <div className="divide-y divide-neutral-800">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-200">Tema scuro</p>
                <p className="text-xs text-neutral-500">Interfaccia con sfondo scuro</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-neutral-100' : 'bg-neutral-700'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-neutral-900 rounded-full transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-200">Notifiche</p>
                <p className="text-xs text-neutral-500">Ricevi notifiche dal team</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-neutral-100' : 'bg-neutral-700'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-neutral-900 rounded-full transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg mb-6">
          <div className="p-4 border-b border-neutral-800">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Sicurezza</span>
          </div>
          <div className="divide-y divide-neutral-800">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-200">Password</p>
                <p className="text-xs text-neutral-500">Modifica la password</p>
              </div>
              <button className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors">
                Modifica
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-neutral-900 border border-red-900/30 rounded-lg">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-200">Esci</p>
              <p className="text-xs text-neutral-500">Disconnetti questa sessione</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-900/50 rounded-lg hover:bg-red-950/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
