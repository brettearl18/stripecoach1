'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextThemeProvider>
  );
} 