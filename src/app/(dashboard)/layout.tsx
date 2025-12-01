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
    <div className="flex min-h-screen bg-[#050505] grid-pattern">
      {/* Noise overlay for texture */}
      <div className="noise-overlay" />

      {/* Ambient orbs */}
      <div className="ambient-orb w-[800px] h-[800px] bg-indigo-950/30 -top-[400px] left-1/4" />
      <div className="ambient-orb w-[600px] h-[600px] bg-purple-950/20 bottom-0 right-0" />
      <div className="ambient-orb w-[400px] h-[400px] bg-blue-950/20 top-1/2 -left-[200px]" />

      <Sidebar />
      <main className="flex-1 overflow-x-hidden relative z-10">
        {children}
      </main>
    </div>
  );
}
