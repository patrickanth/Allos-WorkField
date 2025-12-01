import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#050507] relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="app-background">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
      </div>

      <Sidebar />
      <main className="flex-1 overflow-x-hidden relative z-10">
        {children}
      </main>
    </div>
  );
}
