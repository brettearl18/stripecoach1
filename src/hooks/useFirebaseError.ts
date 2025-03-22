'use client';

import { useState } from 'react';

export function useFirebaseError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  return {
    error,
    setError,
    handleError,
  };
} 