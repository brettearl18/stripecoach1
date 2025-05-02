'use client';

import { useAuth } from '@/hooks/useAuth';
import ResourceManager from '@/components/resources/ResourceManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResourcesPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Please log in to access this page.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ResourceManager />
    </div>
  );
} 