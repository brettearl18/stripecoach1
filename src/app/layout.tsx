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
  title: 'Checkin.io - Stripe Coach Platform',
  description: 'Checkin.io is a coaching platform for client management, progress tracking, and seamless communication. Built with Stripe integration and Firebase.'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="description" content="Checkin.io is a coaching platform for client management, progress tracking, and seamless communication. Built with Stripe integration and Firebase." />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-gray-900 bg-gradient-to-b from-gray-900 to-gray-800">
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
