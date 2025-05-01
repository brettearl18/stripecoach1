'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { createTestCoach } from '@/lib/services/firebaseService';

export default function TestCoaches() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCreateTestCoach = async () => {
    try {
      setLoading(true);
      const coachId = await createTestCoach();
      toast.success(`Test coach created with ID: ${coachId}`);
    } catch (error) {
      console.error('Error creating test coach:', error);
      toast.error('Failed to create test coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white mb-6">Test Coaches</h1>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Create Test Coach</CardTitle>
            <CardDescription className="text-gray-400">
              Create a test coach account for development purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              This will create a test coach account with predefined data. Use this for testing and development only.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateTestCoach}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Test Coach'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 