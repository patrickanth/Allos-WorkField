'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Users,
  LayoutGrid,
  Download,
  Settings,
  LogOut,
  ChevronLeft,
  Lock,
  Globe,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

const navItems = [
  {
    name: 'Le mie Note',
    href: '/notes',
    icon: FileText,
    badge: 'private',
  },
  {
    name: 'Note Team',
    href: '/notes?view=shared',
    icon: Globe,
    badge: 'shared',
  },
  {
    name: 'Tickets',
    href: '/tickets',
    icon: LayoutGrid,
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    name: 'Download Agent',
    href: '/download',
    icon: Download,
  },
  {
    name: 'Impostazioni',
    href: '/settings',
    icon: Settings,
  },
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
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className="h-screen sticky top-0 flex flex-col bg-white dark:bg-dark-800 border-r border-dark-100 dark:border-dark-700"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-dark-900 dark:text-white whitespace-nowrap overflow-hidden"
              >
                Allos <span className="text-primary-500">WorkField</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
        >
          <ChevronLeft className={`w-5 h-5 text-dark-400 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${active
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                  : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'
                }
              `}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-500' : ''}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.badge === 'private'
                    ? 'bg-dark-100 dark:bg-dark-700 text-dark-500'
                    : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                }`}>
                  {item.badge === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {session?.user && (
        <div className="p-3 border-t border-dark-100 dark:border-dark-700">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-dark-50 dark:bg-dark-700/50 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar name={session.user.name || ''} size="sm" />
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="font-medium text-sm text-dark-900 dark:text-white truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-dark-500 truncate">
                    {session.user.teamName || 'Nessun team'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 rounded-lg hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-dark-400" />
              </button>
            )}
          </div>
        </div>
      )}
    </motion.aside>
  );
}
