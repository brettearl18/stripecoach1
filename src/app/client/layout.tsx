'use client';

import { SideNavigation } from '@/components/navigation/SideNavigation';
import { clientNavigation } from '@/components/navigation/navigationConfig';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#121214]">
      <SideNavigation
        items={clientNavigation}
        title="Client Portal"
        userRole="client"
      />
      <main className="md:pl-64">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 