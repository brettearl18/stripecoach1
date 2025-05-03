'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { LineChart, BarChart, DonutChart } from '@tremor/react';
import { Download, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import CategoryComparisonChart from '@/components/analytics/CategoryComparisonChart';
import SentimentHighlights from '@/components/analytics/SentimentHighlights';

const chartdata = [
  { date: '2024-01', "Client Progress": 63, "Check-ins": 40 },
  { date: '2024-02', "Client Progress": 67, "Check-ins": 45 },
  { date: '2024-03', "Client Progress": 72, "Check-ins": 52 },
  { date: '2024-04', "Client Progress": 78, "Check-ins": 58 },
];

const clientStats = [
  { name: 'Active', value: 85 },
  { name: 'At Risk', value: 10 },
  { name: 'Inactive', value: 5 },
];

export default function AnalyticsPage() {
  const [selectedView, setSelectedView] = useState('overview');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your coaching business performance and client progress</p>
        </div>
        <div className="flex items-center gap-4">
          <CalendarDateRangePicker />
          <Button variant="outline" size="icon">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Summary Section */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold mb-6">Analytics Summary</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Comparison Chart */}
          <div className="bg-[#1A1A1A] rounded-lg p-6">
            <CategoryComparisonChart />
          </div>

          {/* Sentiment Highlights */}
          <div className="bg-[#1A1A1A] rounded-lg p-6">
            <SentimentHighlights />
          </div>
        </div>
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Track client progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={chartdata}
                index="date"
                categories={["Client Progress", "Check-ins"]}
                colors={["blue", "green"]}
                yAxisWidth={40}
                height="h-80"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Status Distribution</CardTitle>
                <CardDescription>Current client engagement levels</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={clientStats}
                  category="value"
                  index="name"
                  colors={["green", "yellow", "red"]}
                  height="h-80"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Weekly Check-ins</CardTitle>
                <CardDescription>Client check-in frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={chartdata}
                  index="date"
                  categories={["Check-ins"]}
                  colors={["blue"]}
                  yAxisWidth={40}
                  height="h-80"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Smart analysis of your coaching data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-0">
                <CardHeader>
                  <CardTitle className="text-base">Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Client progress has shown consistent improvement over the last 3 months, 
                    with a notable correlation between check-in frequency and progress rates.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-900/20 border-0">
                <CardHeader>
                  <CardTitle className="text-base">Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                    <li>Focus on re-engaging 5 clients who haven't checked in for over 2 weeks</li>
                    <li>Consider adjusting program intensity for clients showing slower progress</li>
                    <li>Schedule check-ins with 3 high-performing clients for testimonials</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 