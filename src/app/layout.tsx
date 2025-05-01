import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import ClientProviders from './client-providers'
import { SessionProvider } from '@/providers/SessionProvider'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Stripe Coach',
  description: 'Professional coaching platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>
          <ThemeProvider>
            <ClientProviders>
              <div className="relative flex min-h-screen flex-col bg-background">
                {children}
              </div>
            </ClientProviders>
          </ThemeProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
