'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { name: 'Note', href: '/notes' },
  { name: 'Note Team', href: '/notes?view=shared' },
  { name: 'Tickets', href: '/tickets' },
  { name: 'Team', href: '/team' },
  { name: 'Agent', href: '/download' },
  { name: 'Impostazioni', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return pathname + (typeof window !== 'undefined' ? window.location.search : '') === href;
    }
    return pathname === href;
  };

  return (
    <aside className={`h-screen sticky top-0 flex flex-col bg-neutral-950 border-r border-neutral-900 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-neutral-900">
        <Link href="/notes" className="flex items-center gap-2">
          {!collapsed && (
            <span className="text-sm font-medium text-neutral-200 tracking-wide">
              WorkField
            </span>
          )}
          {collapsed && (
            <span className="text-sm font-medium text-neutral-200">W</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded hover:bg-neutral-900 transition-colors text-neutral-500"
        >
          <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-neutral-900 text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50'
              }`}
            >
              {!collapsed && <span>{item.name}</span>}
              {collapsed && <span>{item.name.charAt(0)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {session?.user && (
        <div className="p-3 border-t border-neutral-900">
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-400 font-medium">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-300 truncate">
                    {session.user.name}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-1.5 rounded hover:bg-neutral-900 transition-colors text-neutral-600 hover:text-neutral-400"
                  title="Esci"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
