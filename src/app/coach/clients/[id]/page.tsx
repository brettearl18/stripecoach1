'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Client, getClientById } from '@/lib/services/firebaseService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function ClientDetailsPage() {
  const params = useParams();
  const clientId = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setIsLoading(true);
      const data = await getClientById(clientId);
      setClient(data);
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Client not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Client Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <p className="text-gray-500">{client.email}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button>
              <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
              New Check-in
            </Button>
          </div>
        </div>
      </div>

      {/* Client Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="check-ins">Check-ins</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Goals</CardTitle>
                <CardDescription>Client's current goals and objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(client.goals || []).map((goal, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                    >
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Completed weekly check-in</p>
                      <p className="text-sm text-gray-500">
                        {client.lastCheckIn
                          ? new Date(client.lastCheckIn).toLocaleDateString()
                          : 'No recent check-in'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
                <CardDescription>Key metrics and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add progress metrics here */}
                <div className="text-center text-gray-500">
                  Progress tracking coming soon
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Scheduled check-ins and forms</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add upcoming tasks here */}
                <div className="text-center text-gray-500">
                  No upcoming tasks
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="check-ins">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Check-in History</CardTitle>
                  <CardDescription>View and manage client check-ins</CardDescription>
                </div>
                <Button>
                  <Link href={`/coach/clients/${client.id}/check-ins/new`}>
                    New Check-in
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add check-in history here */}
              <div className="text-center text-gray-500 py-8">
                No check-ins recorded yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tab contents here */}
      </Tabs>
    </div>
  );
} 