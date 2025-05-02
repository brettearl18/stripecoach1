'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import ModuleManager from '@/components/modules/ModuleManager';
import { Card, CardContent } from '@/components/ui/card';

export default function ModulesPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-gray-500">Please sign in to access this page.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ModuleManager />
    </div>
  );
} 