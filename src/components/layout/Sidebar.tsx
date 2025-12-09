'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    name: 'Note Private',
    href: '/notes',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    name: 'Note Team',
    href: '/notes?view=shared',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    name: 'Tickets',
    href: '/tickets',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    )
  },
  {
    name: 'Calendario',
    href: '/calendar',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    name: 'Project Maps',
    href: '/projects',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    )
  },
  {
    name: 'Team',
    href: '/team',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  {
    name: 'Desktop Agent',
    href: '/download',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    )
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Hardcoded user - sempre autenticato
  const user = {
    name: 'Patrick',
    email: 'patrickanthonystudio@gmail.com',
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href.includes('?')) {
      const [path, query] = href.split('?');
      const params = new URLSearchParams(query);
      const view = params.get('view');
      return pathname === path && searchParams.get('view') === view;
    }
    return pathname === href && !searchParams.get('view');
  };

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-[#0a0a0c]/80 backdrop-blur-xl border-r border-white/[0.06]">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-white/[0.06]">
        <Link href="/notes" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center shadow-lg shadow-white/10">
            <span className="text-sm font-bold text-black">A</span>
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">Allos</span>
            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">WORKFIELD</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-4 mb-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Menu</p>
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 h-11 px-4 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                active
                  ? 'bg-white/[0.08] text-white shadow-lg shadow-black/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className={active ? 'text-indigo-400' : 'text-zinc-500'}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Settings link */}
      <div className="px-4 pb-4 border-t border-white/[0.06] pt-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 h-11 px-4 rounded-xl text-[13px] font-medium transition-all duration-200 ${
            pathname === '/settings'
              ? 'bg-white/[0.08] text-white shadow-lg shadow-black/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <span className={pathname === '/settings' ? 'text-indigo-400' : 'text-zinc-500'}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          Impostazioni
        </Link>
      </div>

      {/* User */}
      <div className="px-4 pb-4 border-t border-white/[0.06] pt-4">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
            </div>
            <svg className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl p-2 shadow-2xl shadow-black/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Esci
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
