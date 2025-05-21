'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase-client';

export default function CoachDashboard() {
  const router = useRouter();
  const { uid } = useParams();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCoach() {
      setLoading(true);
      setError('');
      try {
        const coachDoc = await getDoc(doc(db, 'users', uid));
        if (coachDoc.exists()) {
          setCoach(coachDoc.data());
        } else {
          setCoach(null);
        }
      } catch (err) {
        setError('Failed to load coach data');
      } finally {
        setLoading(false);
      }
    }
    if (uid) fetchCoach();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome, Coach!</h1>
          <p>Your dashboard is ready. Start by adding your first client or check-in template.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-800 text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome, {coach.name || 'Coach'}!</h1>
        <p>This is your dashboard. More features coming soon.</p>
      </div>
    </div>
  );
} 