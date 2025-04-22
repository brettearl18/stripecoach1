'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Bell, Calendar as CalendarIcon, Target, Trophy } from 'lucide-react';

interface ClientDashboardProps {
  client: {
    name: string;
    imageUrl?: string;
    goals: {
      weight: number;
      targetWeight: number;
      bodyFat: number;
      targetBodyFat: number;
    };
    nextSession: string;
    progress: {
      weight: number;
      bodyFat: number;
      completionRate: number;
    };
  };
}

export default function ClientDashboard({ client }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={client.imageUrl} />
            <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-sm text-muted-foreground">Next session: {format(new Date(client.nextSession), 'PPP')}</p>
          </div>
        </div>
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{client.progress.weight} kg</div>
                <p className="text-xs text-muted-foreground">
                  Target: {client.goals.targetWeight} kg
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Body Fat %</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{client.progress.bodyFat}%</div>
                <p className="text-xs text-muted-foreground">
                  Target: {client.goals.targetBodyFat}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Program Completion</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{client.progress.completionRate}%</div>
                <Progress value={client.progress.completionRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Progress History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weight Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {client.progress.weight} kg → {client.goals.targetWeight} kg
                    </p>
                  </div>
                  <Badge variant="outline">
                    {((client.progress.weight / client.goals.targetWeight) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={(client.progress.weight / client.goals.targetWeight) * 100} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Training Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Current Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Weight Goal</span>
                  <Badge variant="secondary">
                    {client.progress.weight}kg / {client.goals.targetWeight}kg
                  </Badge>
                </div>
                <Progress value={(client.progress.weight / client.goals.targetWeight) * 100} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Body Fat Goal</span>
                  <Badge variant="secondary">
                    {client.progress.bodyFat}% / {client.goals.targetBodyFat}%
                  </Badge>
                </div>
                <Progress value={(client.progress.bodyFat / client.goals.targetBodyFat) * 100} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 