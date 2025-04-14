import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Setup - Client Portal',
  description: 'Complete your profile setup and preferences',
}

export default function SetupPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Setup</h1>
      <div className="grid gap-8">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          {/* Profile form will go here */}
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          {/* Preferences form will go here */}
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          {/* Notification settings will go here */}
        </section>
      </div>
    </div>
  )
}