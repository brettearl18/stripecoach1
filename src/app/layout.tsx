import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gray-100">
              {children}
            </div>
          </ThemeProvider>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
