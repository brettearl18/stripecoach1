'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColorPicker } from '@/components/ui/color-picker'
import { ImageUpload } from '@/components/ui/image-upload'
import { BusinessService } from '@/lib/services/businessService'
import { useAuth } from '@/hooks/useAuth'

const businessSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  socialLinks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
  }),
})

const brandingSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
})

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  checkInReminders: z.boolean(),
  missedCheckInAlerts: z.boolean(),
  clientMessages: z.boolean(),
  systemUpdates: z.boolean(),
  marketingEmails: z.boolean(),
})

export default function BusinessSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('details')
  
  const businessForm = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: '',
      description: '',
      website: '',
      address: '',
      phone: '',
      email: '',
      socialLinks: {
        instagram: '',
        facebook: '',
        twitter: '',
        linkedin: '',
      },
    },
  })

  const brandingForm = useForm({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      primaryColor: '#4F46E5',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      logo: '',
      favicon: '',
    },
  })

  const notificationForm = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      checkInReminders: true,
      missedCheckInAlerts: true,
      clientMessages: true,
      systemUpdates: true,
      marketingEmails: false,
    },
  })

  useEffect(() => {
    const loadBusinessSettings = async () => {
      if (!user?.uid) return
      
      try {
        const settings = await BusinessService.getBusinessSettings(user.uid)
        if (settings) {
          // Update form values with existing settings
          businessForm.reset(settings.details)
          brandingForm.reset(settings.branding)
          notificationForm.reset(settings.notifications)
        }
      } catch (error) {
        console.error('Error loading business settings:', error)
        toast.error('Failed to load business settings')
      }
    }

    loadBusinessSettings()
  }, [user?.uid])

  const onBusinessSubmit = async (data: z.infer<typeof businessSchema>) => {
    if (!user?.uid) return
    
    try {
      await BusinessService.updateBusinessDetails(user.uid, data)
      toast.success('Business details updated successfully')
    } catch (error) {
      console.error('Error updating business details:', error)
      toast.error('Failed to update business details')
    }
  }

  const onBrandingSubmit = async (data: z.infer<typeof brandingSchema>) => {
    if (!user?.uid) return
    
    try {
      await BusinessService.updateBrandingSettings(user.uid, data)
      toast.success('Branding settings updated successfully')
    } catch (error) {
      console.error('Error updating branding:', error)
      toast.error('Failed to update branding settings')
    }
  }

  const onNotificationSubmit = async (data: z.infer<typeof notificationSchema>) => {
    if (!user?.uid) return
    
    try {
      await BusinessService.updateNotificationPreferences(user.uid, data)
      toast.success('Notification preferences updated successfully')
    } catch (error) {
      console.error('Error updating notifications:', error)
      toast.error('Failed to update notification preferences')
    }
  }

  const handleImageUpload = async (file: File, type: 'logo' | 'favicon') => {
    if (!user?.uid) return
    
    try {
      const url = await BusinessService.uploadImage(user.uid, file, type)
      brandingForm.setValue(type, url)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Business Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="details">Business Details</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Update your business information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      {...businessForm.register('businessName')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...businessForm.register('description')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        {...businessForm.register('website')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...businessForm.register('email')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...businessForm.register('phone')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        {...businessForm.register('address')}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Social Links</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          {...businessForm.register('socialLinks.instagram')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          {...businessForm.register('socialLinks.facebook')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          {...businessForm.register('socialLinks.twitter')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          {...businessForm.register('socialLinks.linkedin')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit">Save Business Details</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize your brand colors and upload your logo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={brandingForm.handleSubmit(onBrandingSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Primary Color</Label>
                      <ColorPicker
                        color={brandingForm.watch('primaryColor')}
                        onChange={(color) => brandingForm.setValue('primaryColor', color)}
                      />
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <ColorPicker
                        color={brandingForm.watch('secondaryColor')}
                        onChange={(color) => brandingForm.setValue('secondaryColor', color)}
                      />
                    </div>
                    <div>
                      <Label>Accent Color</Label>
                      <ColorPicker
                        color={brandingForm.watch('accentColor')}
                        onChange={(color) => brandingForm.setValue('accentColor', color)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Logo</Label>
                      <ImageUpload
                        value={brandingForm.watch('logo')}
                        onChange={(file) => handleImageUpload(file, 'logo')}
                        onRemove={() => brandingForm.setValue('logo', '')}
                      />
                    </div>
                    <div>
                      <Label>Favicon</Label>
                      <ImageUpload
                        value={brandingForm.watch('favicon')}
                        onChange={(file) => handleImageUpload(file, 'favicon')}
                        onRemove={() => brandingForm.setValue('favicon', '')}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit">Save Branding</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationForm.watch('emailNotifications')}
                      onCheckedChange={(checked) => 
                        notificationForm.setValue('emailNotifications', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications on your device</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={notificationForm.watch('pushNotifications')}
                      onCheckedChange={(checked) => 
                        notificationForm.setValue('pushNotifications', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="checkInReminders">Check-in Reminders</Label>
                      <p className="text-sm text-gray-500">Get reminded about upcoming client check-ins</p>
                    </div>
                    <Switch
                      id="checkInReminders"
                      checked={notificationForm.watch('checkInReminders')}
                      onCheckedChange={(checked) => 
                        notificationForm.setValue('checkInReminders', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="missedCheckInAlerts">Missed Check-in Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified when clients miss their check-ins</p>
                    </div>
                    <Switch
                      id="missedCheckInAlerts"
                      checked={notificationForm.watch('missedCheckInAlerts')}
                      onCheckedChange={(checked) => 
                        notificationForm.setValue('missedCheckInAlerts', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="clientMessages">Client Messages</Label>
                      <p className="text-sm text-gray-500">Get notified about new client messages</p>
                    </div>
                    <Switch
                      id="clientMessages"
                      checked={notificationForm.watch('clientMessages')}
                      onCheckedChange={(checked) => 
                        notificationForm.setValue('clientMessages', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemUpdates">System Updates</Label>
                      <p className="text-sm text-gray-500">Get notified about system updates and maintenance</p>
                    </div>
                    <Switch
                      id="systemUpdates"
                      checked={notificationForm.watch('systemUpdates')}
                      onCheckedChange={(checked) => 
                        notificationForm.setValue('systemUpdates', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-gray-500">Receive marketing updates and newsletters</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={notificationForm.watch('marketingEmails')}
                      onCheckedChange={(checked) => 
                        notificationForm.setValue('marketingEmails', checked)
                      }
                    />
                  </div>
                </div>

                <Button type="submit">Save Notification Preferences</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 