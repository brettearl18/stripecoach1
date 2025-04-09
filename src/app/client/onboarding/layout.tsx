'use client';

import { ReactNode } from 'react';

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#141517] flex flex-col">
      {/* Logo/Header */}
      <header className="py-6 px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Welcome to Stripe Coach</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          Need help? Contact support@stripecoach.com
        </div>
      </footer>
    </div>
  );
} 