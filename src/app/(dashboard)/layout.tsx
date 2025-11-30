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
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Ambient light effect - top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-blue-950/20 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Ambient light effect - bottom right */}
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-purple-950/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <Sidebar />
      <main className="flex-1 overflow-x-hidden relative">
        {children}
      </main>
    </div>
  );
}
