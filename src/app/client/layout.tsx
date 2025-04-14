import { ClientNav } from './components/ClientNav'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      <ClientNav />
      <main>{children}</main>
    </div>
  )
} 