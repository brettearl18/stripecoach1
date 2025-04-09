'use client';

import { useState } from 'react';
import { CoachNavigation } from '@/components/navigation/CoachNavigation';
import { Footer } from '@/components/Footer';

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporarily removed authentication check
  return (
    <div className="min-h-screen flex flex-col bg-[#141517]">
      <CoachNavigation />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
} 