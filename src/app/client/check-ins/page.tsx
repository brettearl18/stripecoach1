'use client';

import { useEffect } from 'react';
import { useCheckIns } from '@/hooks/useCheckIns';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CheckInList from '@/components/check-ins/CheckInList';
import { Alert } from '@/components/ui/Alert';

export default function CheckInsPage() {
  const { data: session } = useSession();
  const { checkIns, loading, error } = useCheckIns();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Alert variant="error">
        Error loading check-ins: {error.message}
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Check-ins</h1>
      <CheckInList checkIns={checkIns} />
    </div>
  );
} 