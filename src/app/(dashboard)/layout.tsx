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
    <div className="flex min-h-screen bg-[#09090b]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
