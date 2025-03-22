'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AvatarCard } from '@/components/avatars/AvatarCard';
import { BusinessAvatar } from '@/lib/types/avatar';

export default function AvatarsPage() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<BusinessAvatar[]>([]);

  const handleCreateAvatar = () => {
    router.push('/admin/avatars/new');
  };

  const handleManageAvatar = (id: string) => {
    router.push(`/admin/avatars/${id}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Business Avatars</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your coaching business personas
          </p>
        </div>
        <Button
          onClick={handleCreateAvatar}
          className="bg-primary hover:bg-primary/90"
        >
          Create New Avatar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {avatars.length === 0 ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No Avatars Yet</CardTitle>
              <CardDescription>
                Create your first business avatar to start personalizing your coaching experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Button
                  onClick={handleCreateAvatar}
                  variant="outline"
                  className="mx-auto"
                >
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          avatars.map((avatar) => (
            <AvatarCard
              key={avatar.id}
              avatar={avatar}
              onManage={handleManageAvatar}
            />
          ))
        )}
      </div>
    </div>
  );
} 