'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { platformService } from '@/lib/services/platformService';
import { RegionalSettings, WhiteLabelSettings } from '@/types/platform';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function PlatformSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('regional');

  // Regional Settings State
  const [regionalSettings, setRegionalSettings] = useState<Partial<RegionalSettings>>({
    language: {
      default: 'en',
      available: ['en'],
      fallback: 'en'
    },
    timezone: {
      default: 'UTC',
      format: '24h',
      available: ['UTC']
    },
    dateFormat: {
      short: 'MM/DD/YYYY',
      long: 'MMMM DD, YYYY',
      time: 'HH:mm'
    },
    currency: {
      code: 'USD',
      symbol: '$',
      format: '$0.00'
    },
    compliance: {
      gdpr: false,
      ccpa: false,
      hipaa: false,
      custom: {}
    },
    localization: {
      enabled: false,
      defaultLocale: 'en',
      availableLocales: ['en'],
      autoDetect: false
    }
  });

  // White Label Settings State
  const [whiteLabelSettings, setWhiteLabelSettings] = useState<Partial<WhiteLabelSettings>>({
    branding: {
      logo: {
        primary: '',
        secondary: '',
        favicon: ''
      },
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#0000ff',
        background: '#ffffff',
        text: '#000000'
      },
      typography: {
        fontFamily: 'Arial',
        headingFont: 'Arial',
        bodyFont: 'Arial'
      }
    },
    domain: {
      customDomain: '',
      subdomain: '',
      sslEnabled: false
    },
    email: {
      fromName: '',
      fromEmail: '',
      replyTo: '',
      signature: ''
    },
    content: {
      companyName: '',
      tagline: '',
      footer: '',
      termsUrl: '',
      privacyUrl: ''
    },
    features: {
      customLogin: false,
      customDashboard: false,
      customReports: false,
      customBranding: false
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [regional, whiteLabel] = await Promise.all([
        platformService.getRegionalSettings(),
        platformService.getWhiteLabelSettings()
      ]);

      if (regional) {
        setRegionalSettings(regional);
      }
      if (whiteLabel) {
        setWhiteLabelSettings(whiteLabel);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRegionalSettings = async () => {
    try {
      const success = await platformService.updateRegionalSettings(regionalSettings);
      if (success) {
        toast.success('Regional settings updated successfully');
      } else {
        toast.error('Failed to update regional settings');
      }
    } catch (error) {
      console.error('Error saving regional settings:', error);
      toast.error('Failed to save regional settings');
    }
  };

  const handleSaveWhiteLabelSettings = async () => {
    try {
      const success = await platformService.updateWhiteLabelSettings(whiteLabelSettings);
      if (success) {
        toast.success('White label settings updated successfully');
      } else {
        toast.error('Failed to update white label settings');
      }
    } catch (error) {
      console.error('Error saving white label settings:', error);
      toast.error('Failed to save white label settings');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Platform Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="regional">Regional Settings</TabsTrigger>
          <TabsTrigger value="white-label">White Labeling</TabsTrigger>
        </TabsList>

        <TabsContent value="regional">
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Configure language, timezone, and regional preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Language Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Language Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Default Language</Label>
                      <Select
                        value={regionalSettings.language?.default}
                        onValueChange={(value) => 
                          setRegionalSettings(prev => ({
                            ...prev,
                            language: { ...prev.language!, default: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Available Languages</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {regionalSettings.language?.available.map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timezone Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Timezone Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Default Timezone</Label>
                      <Select
                        value={regionalSettings.timezone?.default}
                        onValueChange={(value) => 
                          setRegionalSettings(prev => ({
                            ...prev,
                            timezone: { ...prev.timezone!, default: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">Eastern Time</SelectItem>
                          <SelectItem value="PST">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Time Format</Label>
                      <Select
                        value={regionalSettings.timezone?.format}
                        onValueChange={(value) => 
                          setRegionalSettings(prev => ({
                            ...prev,
                            timezone: { ...prev.timezone!, format: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Compliance Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Compliance Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={regionalSettings.compliance?.gdpr}
                        onCheckedChange={(checked) => 
                          setRegionalSettings(prev => ({
                            ...prev,
                            compliance: { ...prev.compliance!, gdpr: checked }
                          }))
                        }
                      />
                      <Label>GDPR Compliance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={regionalSettings.compliance?.ccpa}
                        onCheckedChange={(checked) => 
                          setRegionalSettings(prev => ({
                            ...prev,
                            compliance: { ...prev.compliance!, ccpa: checked }
                          }))
                        }
                      />
                      <Label>CCPA Compliance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={regionalSettings.compliance?.hipaa}
                        onCheckedChange={(checked) => 
                          setRegionalSettings(prev => ({
                            ...prev,
                            compliance: { ...prev.compliance!, hipaa: checked }
                          }))
                        }
                      />
                      <Label>HIPAA Compliance</Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveRegionalSettings}>Save Regional Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="white-label">
          <Card>
            <CardHeader>
              <CardTitle>White Label Settings</CardTitle>
              <CardDescription>Customize your platform's appearance and branding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Branding Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Branding</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={whiteLabelSettings.content?.companyName}
                        onChange={(e) => 
                          setWhiteLabelSettings(prev => ({
                            ...prev,
                            content: { ...prev.content!, companyName: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Tagline</Label>
                      <Input
                        value={whiteLabelSettings.content?.tagline}
                        onChange={(e) => 
                          setWhiteLabelSettings(prev => ({
                            ...prev,
                            content: { ...prev.content!, tagline: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Primary Color</Label>
                      <Input
                        type="color"
                        value={whiteLabelSettings.branding?.colors.primary}
                        onChange={(e) => 
                          setWhiteLabelSettings(prev => ({
                            ...prev,
                            branding: {
                              ...prev.branding!,
                              colors: { ...prev.branding!.colors, primary: e.target.value }
                            }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Domain Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Domain Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Custom Domain</Label>
                      <Input
                        value={whiteLabelSettings.domain?.customDomain}
                        onChange={(e) => 
                          setWhiteLabelSettings(prev => ({
                            ...prev,
                            domain: { ...prev.domain!, customDomain: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={whiteLabelSettings.domain?.sslEnabled}
                        onCheckedChange={(checked) => 
                          setWhiteLabelSettings(prev => ({
                            ...prev,
                            domain: { ...prev.domain!, sslEnabled: checked }
                          }))
                        }
                      />
                      <Label>Enable SSL</Label>
                    </div>
                  </div>
                </div>

                {/* Email Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Email Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>From Name</Label>
                      <Input
                        value={whiteLabelSettings.email?.fromName}
                        onChange={(e) => 
                          setWhiteLabelSettings(prev => ({
                            ...prev,
                            email: { ...prev.email!, fromName: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>From Email</Label>
                      <Input
                        type="email"
                        value={whiteLabelSettings.email?.fromEmail}
                        onChange={(e) => 
                          setWhiteLabelSettings(prev => ({
                            ...prev,
                            email: { ...prev.email!, fromEmail: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveWhiteLabelSettings}>Save White Label Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 