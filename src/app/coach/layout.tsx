'use client';

import DashboardNav from '@/components/DashboardNav';

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#13141A]">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 