'use client';

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { Providers } from './providers';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthProvider>
        <Providers>
          {children}
        </Providers>
      </AuthProvider>
    </SessionProvider>
  );
} 