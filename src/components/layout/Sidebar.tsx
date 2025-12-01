'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const navigation = [
  { name: 'Note', href: '/notes' },
  { name: 'Note Team', href: '/notes?view=shared' },
  { name: 'Tickets', href: '/tickets' },
  { name: 'Team', href: '/team' },
  { name: 'Agent', href: '/download' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    <aside className="w-60 h-screen sticky top-0 flex flex-col bg-[#0f0f11] border-r border-zinc-800/50">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-zinc-800/50">
        <Link href="/notes" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-sm font-bold text-black">A</span>
          </div>
          <span className="text-[15px] font-semibold text-white">Allos</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center h-10 px-3 rounded-lg text-[14px] transition-colors ${
                active
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Settings link */}
      <div className="p-3 border-t border-zinc-800/50">
        <Link
          href="/settings"
          className={`flex items-center h-10 px-3 rounded-lg text-[14px] transition-colors ${
            pathname === '/settings'
              ? 'bg-zinc-800 text-white font-medium'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          Impostazioni
        </Link>
      </div>

      {/* User */}
      {session?.user && (
        <div className="p-3 border-t border-zinc-800/50">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-400">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[14px] text-white truncate">{session.user.name}</p>
                <p className="text-[12px] text-zinc-500 truncate">{session.user.email}</p>
              </div>
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1 shadow-xl">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
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
      )}
    </aside>
  );
}
