import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import ClientProviders from './client-providers'

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
      <body className="antialiased font-sans">
        <ClientProviders>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {children}
          </div>
        </ClientProviders>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
