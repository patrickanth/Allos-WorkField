'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { name: 'Note', href: '/notes', section: 'personal' },
  { name: 'Note Team', href: '/notes?view=shared', section: 'team' },
  { name: 'Tickets', href: '/tickets', section: 'team' },
  { name: 'Team', href: '/team', section: 'team' },
  { name: 'Agent', href: '/download', section: 'tools' },
  { name: 'Impostazioni', href: '/settings', section: 'settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => {
    if (href.includes('?')) {
      const [path, query] = href.split('?');
      const params = new URLSearchParams(query);
      const view = params.get('view');
      return pathname === path && searchParams.get('view') === view;
    }
    return pathname === href && !searchParams.get('view');
  };

  const sections = [
    { key: 'personal', label: 'Personale' },
    { key: 'team', label: 'Team' },
    { key: 'tools', label: 'Strumenti' },
    { key: 'settings', label: null },
  ];

  return (
    <aside className={`h-screen sticky top-0 flex flex-col bg-neutral-950 border-r border-neutral-900/50 transition-all duration-500 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <Link href="/notes" className="flex items-center gap-3 group">
          {!collapsed && mounted && (
            <div className="flex flex-col">
              <span className="text-lg font-extralight tracking-[0.2em] text-neutral-200 uppercase">
                Allos
              </span>
              <span className="text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
                WorkField
              </span>
            </div>
          )}
          {collapsed && (
            <span className="text-lg font-extralight text-neutral-200">A</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-neutral-900 transition-all duration-300 text-neutral-600 hover:text-neutral-400"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {sections.map((section) => {
          const sectionItems = navItems.filter(item => item.section === section.key);
          if (sectionItems.length === 0) return null;

          return (
            <div key={section.key} className="mb-6">
              {!collapsed && section.label && (
                <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-neutral-600">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {sectionItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 rounded-xl text-sm transition-all duration-300 group relative ${
                        active
                          ? 'bg-neutral-900/80 text-neutral-100'
                          : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/40'
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-neutral-400 rounded-full" />
                      )}
                      {!collapsed && <span className="ml-1">{item.name}</span>}
                      {collapsed && (
                        <span className="mx-auto">{item.name.charAt(0)}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User section */}
      {session?.user && (
        <div className="p-4 border-t border-neutral-900/50">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs text-neutral-400 font-medium">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-300 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-[10px] text-neutral-600 truncate">
                    {session.user.email}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-2 rounded-lg hover:bg-neutral-900 transition-all duration-300 text-neutral-600 hover:text-red-400"
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
