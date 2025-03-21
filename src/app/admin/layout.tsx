'use client';

import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AdminSidebar />
      <div className="lg:pl-64">
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
} 