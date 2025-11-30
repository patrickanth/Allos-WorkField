import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Allos WorkField - Spazio di Lavoro Collaborativo',
  description: 'La piattaforma di lavoro collaborativo per il tuo team. Note condivise, gestione ticket e molto altro.',
  keywords: ['workspace', 'collaboration', 'team', 'notes', 'tickets', 'productivity'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-screen bg-dark-50 dark:bg-dark-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
