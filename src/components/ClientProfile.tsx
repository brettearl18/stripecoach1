'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface ClientProfileProps {
  client: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
    goals: string[];
    progress: {
      weight: number;
      targetWeight: number;
      bodyFat: number;
      targetBodyFat: number;
    };
    lastCheckIn: string;
    nextSession: string;
  };
}

export default function ClientProfile({ client }: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.imageUrl} />
              <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{client.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{client.email}</p>
            </div>
          </div>
          <Button variant="outline">Edit Profile</Button>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Current Weight</Label>
                <div className="flex items-center space-x-2">
                  <Input value={client.progress.weight} readOnly />
                  <Badge variant="secondary">kg</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Body Fat %</Label>
                <div className="flex items-center space-x-2">
                  <Input value={client.progress.bodyFat} readOnly />
                  <Badge variant="secondary">%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Towards Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Weight Goal</span>
                  <span>{client.progress.weight}kg / {client.progress.targetWeight}kg</span>
                </div>
                <Progress 
                  value={(client.progress.weight / client.progress.targetWeight) * 100} 
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Body Fat Goal</span>
                  <span>{client.progress.bodyFat}% / {client.progress.targetBodyFat}%</span>
                </div>
                <Progress 
                  value={(client.progress.bodyFat / client.progress.targetBodyFat) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Progress History</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Progress history content */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Current Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {client.goals.map((goal, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Badge variant="outline">{goal}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Last Check-in</Label>
                  <p>{format(new Date(client.lastCheckIn), 'PPP')}</p>
                </div>
                <div>
                  <Label>Next Session</Label>
                  <p>{format(new Date(client.nextSession), 'PPP')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 