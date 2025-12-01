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
        <p className="page-subtitle">Gestisci il tuo profilo e le preferenze</p>
      </div>

      {/* Profile */}
      <div className="card p-8 lg:p-10 mb-8">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.06]">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Profilo</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="avatar avatar-glow w-20 h-20 rounded-2xl text-2xl shrink-0">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xl text-white font-semibold mb-2 truncate">{session?.user?.name}</p>
            <p className="text-[15px] text-zinc-400 truncate">{session?.user?.email}</p>
            {session?.user?.teamId && (
              <span className="badge badge-purple mt-3">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Membro di un team
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card overflow-hidden mb-8">
        <div className="p-6 lg:p-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Preferenze</span>
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          <div className="p-6 lg:p-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[15px] text-white font-medium mb-2">Tema scuro</p>
              <p className="text-[14px] text-zinc-500">Interfaccia con sfondo scuro per un comfort visivo ottimale</p>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`toggle shrink-0 ${isDark ? 'active' : ''}`}
            />
          </div>
          <div className="p-6 lg:p-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[15px] text-white font-medium mb-2">Notifiche</p>
              <p className="text-[14px] text-zinc-500">Ricevi notifiche quando ci sono aggiornamenti dal team</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`toggle shrink-0 ${notifications ? 'active' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card overflow-hidden mb-8">
        <div className="p-6 lg:p-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Sicurezza</span>
          </div>
        </div>
        <div className="p-6 lg:p-8 flex items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[15px] text-white font-medium mb-2">Password</p>
            <p className="text-[14px] text-zinc-500">Modifica la password del tuo account</p>
          </div>
          <button className="btn btn-secondary shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="hidden sm:inline">Modifica</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="card p-6 lg:p-8">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[15px] text-white font-medium mb-2">Esci dall'account</p>
            <p className="text-[14px] text-zinc-500">Disconnetti questa sessione dal tuo account</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn btn-danger shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
