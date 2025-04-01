"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Settings, Bell, Shield, User, Zap, Clock, Palette, FileText, CreditCard, Globe, Linkedin, Instagram, Twitter, Phone, MapPin, Link, Calendar, Video, Puzzle } from 'lucide-react';
import { IntegrationCard } from '@/components/coach/IntegrationCard';
import { auth } from '@/lib/firebase/config';

// Time zones array with UTC offsets
const TIME_ZONES = [
  { value: 'Pacific/Honolulu', label: 'UTC-10:00 Hawaii' },
  { value: 'America/Anchorage', label: 'UTC-09:00 Alaska' },
  { value: 'America/Los_Angeles', label: 'UTC-08:00 Pacific Time' },
  { value: 'America/Phoenix', label: 'UTC-07:00 Mountain Time (no DST)' },
  { value: 'America/Denver', label: 'UTC-07:00 Mountain Time' },
  { value: 'America/Chicago', label: 'UTC-06:00 Central Time' },
  { value: 'America/New_York', label: 'UTC-05:00 Eastern Time' },
  { value: 'America/Halifax', label: 'UTC-04:00 Atlantic Time' },
  { value: 'America/St_Johns', label: 'UTC-03:30 Newfoundland' },
  { value: 'America/Sao_Paulo', label: 'UTC-03:00 São Paulo' },
  { value: 'UTC', label: 'UTC±00:00 London, Dublin' },
  { value: 'Europe/Paris', label: 'UTC+01:00 Central European Time' },
  { value: 'Europe/Helsinki', label: 'UTC+02:00 Eastern European Time' },
  { value: 'Asia/Dubai', label: 'UTC+04:00 Dubai' },
  { value: 'Asia/Kolkata', label: 'UTC+05:30 India' },
  { value: 'Asia/Bangkok', label: 'UTC+07:00 Bangkok' },
  { value: 'Asia/Singapore', label: 'UTC+08:00 Singapore' },
  { value: 'Asia/Tokyo', label: 'UTC+09:00 Tokyo' },
  { value: 'Australia/Sydney', label: 'UTC+10:00 Sydney' },
  { value: 'Pacific/Auckland', label: 'UTC+12:00 New Zealand' }
];

export default function SettingsPage() {
  const [coachId, setCoachId] = useState<string>('default-coach-id');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workingHours, setWorkingHours] = useState({
    timezone: 'UTC',
    schedule: {
      Monday: { enabled: true, start: '09:00', end: '17:00' },
      Tuesday: { enabled: true, start: '09:00', end: '17:00' },
      Wednesday: { enabled: true, start: '09:00', end: '17:00' },
      Thursday: { enabled: true, start: '09:00', end: '17:00' },
      Friday: { enabled: true, start: '09:00', end: '17:00' },
      Saturday: { enabled: false, start: '09:00', end: '17:00' },
      Sunday: { enabled: false, start: '09:00', end: '17:00' }
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
      </div>
    );
  }

  // Mock data - replace with actual data from your backend
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Experienced life coach helping clients achieve their goals.',
    avatar: '/default-avatar.png',
    specialties: ['Life Coaching', 'Career Development', 'Personal Growth'],
    timezone: 'America/New_York',
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update logic
    console.log('Updating profile:', profile);
  };

  const handleAvailabilityToggle = (day: string) => {
    setProfile(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: !prev.availability[day],
      },
    }));
  };

  const handleNotificationToggle = (type: string) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
  };

  const handleTimeChange = (day: string, type: 'start' | 'end', value: string) => {
    const currentDay = workingHours.schedule[day];
    let newStart = type === 'start' ? value : currentDay.start;
    let newEnd = type === 'end' ? value : currentDay.end;

    // Validate that end time is after start time
    if (newEnd <= newStart) {
      if (type === 'start') {
        // If changing start time, adjust end time to be 1 hour later
        const startDate = new Date(`2000-01-01T${newStart}`);
        startDate.setHours(startDate.getHours() + 1);
        newEnd = startDate.toTimeString().slice(0, 5);
      } else {
        // If changing end time, adjust start time to be 1 hour earlier
        const endDate = new Date(`2000-01-01T${newEnd}`);
        endDate.setHours(endDate.getHours() - 1);
        newStart = endDate.toTimeString().slice(0, 5);
      }
    }

    setWorkingHours(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          start: newStart,
          end: newEnd
        }
      }
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f1729] text-white">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <TabsList className="lg:w-64 h-fit flex flex-col bg-[#1a2234] rounded-lg border border-[#2a3441] p-0 overflow-hidden">
            <TabsTrigger
              value="profile"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[#2a3441]/50 transition-colors data-[state=active]:bg-[#2a3441] data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-blue-500 rounded-none"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[#2a3441]/50 transition-colors data-[state=active]:bg-[#2a3441] data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-blue-500 rounded-none"
            >
              <Puzzle className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger
              value="ai-settings"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[#2a3441]/50 transition-colors data-[state=active]:bg-[#2a3441] data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-blue-500 rounded-none"
            >
              <Zap className="h-4 w-4" />
              AI Settings
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[#2a3441]/50 transition-colors data-[state=active]:bg-[#2a3441] data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-blue-500 rounded-none"
            >
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[#2a3441]/50 transition-colors data-[state=active]:bg-[#2a3441] data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-blue-500 rounded-none"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[#2a3441]/50 transition-colors data-[state=active]:bg-[#2a3441] data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-blue-500 rounded-none"
            >
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[#2a3441]/50 transition-colors data-[state=active]:bg-[#2a3441] data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-blue-500 rounded-none"
            >
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[#2a3441]/50 transition-colors data-[state=active]:bg-[#2a3441] data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-blue-500 rounded-none"
            >
              <CreditCard className="h-4 w-4" />
              Payments & Billing
            </TabsTrigger>
          </TabsList>

          {/* Main Content */}
          <div className="flex-1">
            <TabsContent value="profile" className="mt-0">
              <Card className="bg-[#1a2234] border-[#2a3441]">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription className="text-gray-400">Update your personal information and coaching profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-8">
                    <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/default-avatar.png" alt="Profile" />
                        <AvatarFallback className="text-lg">J</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" className="bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white">
                        Change Avatar
                      </Button>
                    </div>

                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          className="bg-[#0f1729] border-[#2a3441] max-w-xl"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="bg-[#0f1729] border-[#2a3441] max-w-xl"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Write a brief description of your coaching experience and approach..."
                          className="bg-[#0f1729] border-[#2a3441] min-h-[120px]"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Specialties</Label>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-[#2a3441] hover:bg-[#2a3441]/80 text-white">Life Coaching</Badge>
                          <Badge className="bg-[#2a3441] hover:bg-[#2a3441]/80 text-white">Career Development</Badge>
                          <Badge className="bg-[#2a3441] hover:bg-[#2a3441]/80 text-white">Personal Growth</Badge>
                          <Button variant="outline" size="sm" className="h-7 bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white">
                            Add Specialty
                          </Button>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="grid gap-4">
                        <h3 className="text-sm font-medium">Additional Contact Information</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              Phone Number
                            </Label>
                            <Input
                              type="tel"
                              placeholder="Enter your phone number"
                              className="bg-[#0f1729] border-[#2a3441]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              Location
                            </Label>
                            <Input
                              placeholder="City, Country"
                              className="bg-[#0f1729] border-[#2a3441]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              Website
                            </Label>
                            <Input
                              type="url"
                              placeholder="https://your-website.com"
                              className="bg-[#0f1729] border-[#2a3441]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Link className="h-4 w-4 text-gray-400" />
                              Booking Link
                            </Label>
                            <Input
                              type="url"
                              placeholder="https://calendly.com/your-profile"
                              className="bg-[#0f1729] border-[#2a3441]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Social Media Profiles */}
                      <div className="grid gap-4">
                        <h3 className="text-sm font-medium">Social Media Profiles</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Linkedin className="h-4 w-4 text-gray-400" />
                              LinkedIn Profile
                            </Label>
                            <Input
                              type="url"
                              placeholder="https://linkedin.com/in/your-profile"
                              className="bg-[#0f1729] border-[#2a3441]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Twitter className="h-4 w-4 text-gray-400" />
                              X (Twitter) Profile
                            </Label>
                            <Input
                              type="url"
                              placeholder="https://x.com/your-handle"
                              className="bg-[#0f1729] border-[#2a3441]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Instagram className="h-4 w-4 text-gray-400" />
                              Instagram Profile
                            </Label>
                            <Input
                              type="url"
                              placeholder="https://instagram.com/your-handle"
                              className="bg-[#0f1729] border-[#2a3441]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              className="w-full bg-[#0f1729] border-[#2a3441] border-dashed hover:bg-[#2a3441] hover:text-white"
                            >
                              Add Another Platform
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">Your social media profiles will be visible to clients and help establish your online presence</p>
                      </div>

                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="mt-0 space-y-6">
              <Card className="bg-[#1a2234] border-[#2a3441]">
                <CardHeader>
                  <CardTitle>External Integrations</CardTitle>
                  <CardDescription className="text-gray-400">Connect your coaching platform with external services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Google Calendar Integration */}
                  <IntegrationCard
                    coachId={coachId || ''}
                    provider="google_calendar"
                    title="Google Calendar"
                    description="Sync your coaching sessions with Google Calendar"
                    icon={Calendar}
                    iconColor="text-blue-500"
                  />

                  {/* Zoom Integration */}
                  <IntegrationCard
                    coachId={coachId || ''}
                    provider="zoom"
                    title="Zoom"
                    description="Automatically create and manage Zoom meetings"
                    icon={Video}
                    iconColor="text-blue-500"
                  />

                  {/* Loom Integration */}
                  <IntegrationCard
                    coachId={coachId || ''}
                    provider="loom"
                    title="Loom"
                    description="Record and share video messages with clients"
                    icon={Video}
                    iconColor="text-purple-500"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-settings" className="mt-0 space-y-6">
              <Card className="bg-[#1a2234] border-[#2a3441]">
                <CardHeader>
                  <CardTitle>AI Assistant Settings</CardTitle>
                  <CardDescription className="text-gray-400">Customize how AI helps with your coaching practice</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-medium">AI Credits</h3>
                          <p className="text-xs text-gray-400 mt-1">Your current AI usage and available credits</p>
                        </div>
                        <Button variant="outline" size="sm" className="bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white">
                          Buy Credits
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Available Credits</span>
                          <span className="font-medium">1,500</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Used This Month</span>
                          <span className="font-medium">500</span>
                        </div>
                        <div className="h-2 bg-[#2a3441] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 w-1/4"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                      <div className="space-y-0.5">
                        <Label>Automatic Check-in Summaries</Label>
                        <p className="text-sm text-gray-400">Generate AI summaries when clients submit check-ins</p>
                      </div>
                      <Switch className="data-[state=checked]:bg-blue-600" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                      <div className="space-y-0.5">
                        <Label>Progress Insights</Label>
                        <p className="text-sm text-gray-400">AI-powered analysis of client progress patterns</p>
                      </div>
                      <Switch className="data-[state=checked]:bg-blue-600" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                      <div className="space-y-0.5">
                        <Label>Session Preparation</Label>
                        <p className="text-sm text-gray-400">Get AI-generated session prep notes based on client history</p>
                      </div>
                      <Switch className="data-[state=checked]:bg-blue-600" />
                    </div>

                    <div className="space-y-3">
                      <Label>AI Language Model</Label>
                      <select className="w-full rounded-md border border-[#2a3441] bg-[#0f1729] px-3 py-2 text-sm">
                        <option value="gpt-4">GPT-4 (Recommended)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </select>
                      <p className="text-xs text-gray-400">Select the AI model that best fits your needs and budget</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2234] border-[#2a3441]">
                <CardHeader>
                  <CardTitle>AI Assistant Training</CardTitle>
                  <CardDescription className="text-gray-400">Train your AI assistant to match your coaching style and approach</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Your Coaching Style</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441] hover:border-blue-500/50 cursor-pointer transition-colors">
                          <input type="checkbox" className="mr-3" />
                          <div>
                            <p className="text-sm font-medium">Direct and Action-Oriented</p>
                            <p className="text-xs text-gray-400">Focus on clear goals and specific actions</p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441] hover:border-blue-500/50 cursor-pointer transition-colors">
                          <input type="checkbox" className="mr-3" />
                          <div>
                            <p className="text-sm font-medium">Supportive and Empathetic</p>
                            <p className="text-xs text-gray-400">Emphasis on emotional support and understanding</p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441] hover:border-blue-500/50 cursor-pointer transition-colors">
                          <input type="checkbox" className="mr-3" />
                          <div>
                            <p className="text-sm font-medium">Analytical and Strategic</p>
                            <p className="text-xs text-gray-400">Data-driven approach with strategic planning</p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441] hover:border-blue-500/50 cursor-pointer transition-colors">
                          <input type="checkbox" className="mr-3" />
                          <div>
                            <p className="text-sm font-medium">Growth-Minded and Exploratory</p>
                            <p className="text-xs text-gray-400">Focus on personal development and discovery</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Communication Preferences</Label>
                      <Textarea 
                        placeholder="Provide examples of how you typically communicate with clients. Include specific phrases or approaches you commonly use..."
                        className="bg-[#0f1729] border-[#2a3441] min-h-[120px]"
                      />
                      <p className="text-xs text-gray-400">This helps the AI understand and mirror your communication style</p>
                    </div>

                    <div className="space-y-3">
                      <Label>Sample Coaching Responses</Label>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">How would you respond to a client who is struggling with procrastination?</p>
                          <Textarea 
                            className="bg-[#0f1729] border-[#2a3441]"
                            placeholder="Enter your typical response..."
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">How do you celebrate client wins?</p>
                          <Textarea 
                            className="bg-[#0f1729] border-[#2a3441]"
                            placeholder="Enter your typical response..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button variant="outline" className="bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white">
                        Test AI Response
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Save & Train AI
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <Card className="bg-[#1a2234] border-[#2a3441]">
                <CardHeader>
                  <CardTitle>Default Templates</CardTitle>
                  <CardDescription className="text-gray-400">Configure your default templates for coaching sessions and check-ins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Check-in Template</Label>
                      <select className="w-full rounded-md border border-[#2a3441] bg-[#0f1729] px-3 py-2 text-sm">
                        <option value="basic">Basic Check-in</option>
                        <option value="detailed">Detailed Progress Report</option>
                        <option value="goals">Goals Focus</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <Label>Session Notes Template</Label>
                      <select className="w-full rounded-md border border-[#2a3441] bg-[#0f1729] px-3 py-2 text-sm">
                        <option value="standard">Standard Session Notes</option>
                        <option value="comprehensive">Comprehensive Review</option>
                        <option value="action">Action-Focused</option>
                      </select>
                    </div>

                    <Button variant="outline" className="w-full bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white">
                      Customize Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0">
              <Card className="bg-[#1a2234] border-[#2a3441]">
                <CardHeader>
                  <CardTitle>Coaching Preferences</CardTitle>
                  <CardDescription className="text-gray-400">Customize your coaching dashboard and experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Time Zone Settings */}
                    <div className="space-y-3">
                      <Label>Time Zone</Label>
                      <select 
                        className="w-full rounded-md border border-[#2a3441] bg-[#0f1729] px-3 py-2 text-sm"
                        value={workingHours.timezone}
                        onChange={(e) => setWorkingHours(prev => ({ ...prev, timezone: e.target.value }))}
                      >
                        {TIME_ZONES.map(tz => (
                          <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Availability */}
                    <div className="space-y-3">
                      <Label>Working Hours</Label>
                      <div className="grid gap-4">
                        {Object.entries(workingHours.schedule).map(([day, hours]) => (
                          <div key={day} className="flex items-center justify-between p-3 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                            <div className="flex items-center space-x-3">
                              <Switch 
                                checked={hours.enabled}
                                onCheckedChange={(checked) => setWorkingHours(prev => ({
                                  ...prev,
                                  schedule: {
                                    ...prev.schedule,
                                    [day]: { ...prev.schedule[day], enabled: checked }
                                  }
                                }))}
                                className="data-[state=checked]:bg-blue-600"
                              />
                              <span className="text-sm font-medium">{day}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <input
                                type="time"
                                value={hours.start}
                                onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                                className="rounded border border-[#2a3441] bg-[#0f1729] px-2 py-1"
                                disabled={!hours.enabled}
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={hours.end}
                                onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                                className="rounded border border-[#2a3441] bg-[#0f1729] px-2 py-1"
                                disabled={!hours.enabled}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Session Duration */}
                    <div className="space-y-3">
                      <Label>Default Session Duration</Label>
                      <select className="w-full rounded-md border border-[#2a3441] bg-[#0f1729] px-3 py-2 text-sm">
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                      </select>
                    </div>

                    {/* Dashboard Customization */}
                    <div className="space-y-3">
                      <Label>Dashboard Layout</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441] hover:border-blue-500/50 cursor-pointer transition-colors">
                          <input type="radio" name="layout" className="mr-3" />
                          <div>
                            <p className="text-sm font-medium">Compact View</p>
                            <p className="text-xs text-gray-400">Maximize screen space</p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441] hover:border-blue-500/50 cursor-pointer transition-colors">
                          <input type="radio" name="layout" className="mr-3" />
                          <div>
                            <p className="text-sm font-medium">Comfortable View</p>
                            <p className="text-xs text-gray-400">More spacing between elements</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button className="bg-blue-600 hover:bg-blue-700">Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <Card className="bg-[#1a2234] border-[#2a3441]">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription className="text-gray-400">Manage your account security and privacy settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Password Change */}
                    <div className="space-y-4 p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium">Password</h3>
                          <p className="text-xs text-gray-400 mt-1">Last changed 3 months ago</p>
                        </div>
                        <Button variant="outline" size="sm" className="bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white">
                          Change Password
                        </Button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="space-y-4 p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                          <p className="text-xs text-gray-400 mt-1">Add an extra layer of security to your account</p>
                        </div>
                        <Switch className="data-[state=checked]:bg-blue-600" />
                      </div>
                    </div>

                    {/* Data Export */}
                    <div className="space-y-4 p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium">Export Your Data</h3>
                          <p className="text-xs text-gray-400 mt-1">Download a complete backup of your coaching data</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="clients" className="rounded border-[#2a3441] bg-[#0f1729]" />
                            <Label htmlFor="clients" className="text-sm">Client Profiles & History</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="sessions" className="rounded border-[#2a3441] bg-[#0f1729]" />
                            <Label htmlFor="sessions" className="text-sm">Session Notes & Check-ins</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="templates" className="rounded border-[#2a3441] bg-[#0f1729]" />
                            <Label htmlFor="templates" className="text-sm">Custom Templates</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="analytics" className="rounded border-[#2a3441] bg-[#0f1729]" />
                            <Label htmlFor="analytics" className="text-sm">Analytics & Reports</Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <select className="flex-1 rounded-md border border-[#2a3441] bg-[#0f1729] px-3 py-2 text-sm">
                              <option value="json">JSON Format</option>
                              <option value="csv">CSV Format</option>
                              <option value="pdf">PDF Format</option>
                            </select>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              Export Data
                            </Button>
                          </div>
                          <p className="text-xs text-gray-400">Your data will be exported in a secure, encrypted format</p>
                        </div>
                      </div>
                    </div>

                    {/* Login History */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Recent Login Activity</h3>
                      <div className="space-y-3">
                        {[
                          { device: 'MacBook Pro', location: 'Sydney, AU', time: '2 minutes ago' },
                          { device: 'iPhone 13', location: 'Sydney, AU', time: '1 hour ago' },
                          { device: 'Chrome Browser', location: 'Melbourne, AU', time: 'Yesterday' }
                        ].map((login, index) => (
                          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                            <div>
                              <p className="text-sm font-medium">{login.device}</p>
                              <p className="text-xs text-gray-400">{login.location}</p>
                            </div>
                            <p className="text-xs text-gray-400">{login.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Connected Apps */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Connected Applications</h3>
                      <div className="space-y-3">
                        {[
                          { name: 'Google Calendar', connected: '2 months ago' },
                          { name: 'Zoom', connected: '2 months ago' }
                        ].map((app, index) => (
                          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                            <div>
                              <p className="text-sm font-medium">{app.name}</p>
                              <p className="text-xs text-gray-400">Connected {app.connected}</p>
                            </div>
                            <Button variant="outline" size="sm" className="bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white">
                              Disconnect
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="space-y-4 p-4 rounded-lg bg-[#0f1729] border border-red-900/50">
                      <div>
                        <h3 className="text-sm font-medium text-red-500">Danger Zone</h3>
                        <p className="text-xs text-gray-400 mt-1">Permanently delete your account and all associated data</p>
                      </div>
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="mt-0">
              <Card className="bg-[#1a2234] border-[#2a3441]">
                <CardHeader>
                  <CardTitle>Payments & Billing</CardTitle>
                  <CardDescription className="text-gray-400">Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-sm font-medium">Current Plan</h3>
                          <p className="text-xs text-gray-400 mt-1">Professional Plan - $49/month</p>
                        </div>
                        <Badge className="bg-blue-600">Active</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">Next billing date:</span>
                          <span>March 24, 2024</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white">
                            Change Plan
                          </Button>
                          <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                            Cancel Subscription
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Payment Methods</h3>
                        <Button variant="outline" size="sm" className="bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white">
                          Add New Card
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-12 bg-[#2a3441] rounded flex items-center justify-center">
                              <span className="text-xs">VISA</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">•••• 4242</p>
                              <p className="text-xs text-gray-400">Expires 12/24</p>
                            </div>
                          </div>
                          <Badge className="bg-green-600">Default</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Billing History */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Billing History</h3>
                      <div className="space-y-3">
                        {[
                          { date: 'Feb 24, 2024', amount: '$49.00', status: 'Paid' },
                          { date: 'Jan 24, 2024', amount: '$49.00', status: 'Paid' },
                          { date: 'Dec 24, 2023', amount: '$49.00', status: 'Paid' }
                        ].map((invoice, index) => (
                          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                            <div>
                              <p className="text-sm font-medium">{invoice.date}</p>
                              <p className="text-xs text-gray-400">{invoice.amount}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-green-600">{invoice.status}</Badge>
                              <Button variant="outline" size="sm" className="bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white">
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 