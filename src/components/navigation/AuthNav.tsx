'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AuthNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="fixed top-0 right-0 p-4 flex gap-4 items-center">
      {user ? (
        <>
          <span className="text-sm text-gray-600">
            Logged in as: {user.email} ({user.role})
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Log Out
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Log In
        </Link>
      )}
    </div>
  );
} 