import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check
  const session = await auth.api.getSession({
    headers: await import('next/headers').then(m => m.headers()),
  });

  // If no session or user is not an admin, redirect to home
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar user={session.user} />
      
      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
