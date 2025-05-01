'use client';

import { useEffect } from 'react'
import { SessionProvider } from '@/lib/hooks/useSession'
import { ThemeProvider } from '@/components/ThemeProvider'
import ClientProviders from './client-providers'
import { initializeSessionTracking } from '@/lib/services/sessionService'

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Initialize session tracking when the app loads
    initializeSessionTracking();
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider>
        <ClientProviders>
          <div className="relative flex min-h-screen flex-col bg-background">
            {children}
          </div>
        </ClientProviders>
      </ThemeProvider>
    </SessionProvider>
  );
} 