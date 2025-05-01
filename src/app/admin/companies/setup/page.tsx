'use client';

import { useState } from 'react';
import { companySetupService } from '@/lib/services/companySetupService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CompanySetupPage() {
  const [loading, setLoading] = useState(false);
  const [setupType, setSetupType] = useState<'manual' | 'vana'>('manual');
  const router = useRouter();

  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    adminEmail: '',
    adminPassword: '',
  });

  const [coachData, setCoachData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialties: '',
    certifications: '',
  });

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { companyId } = await companySetupService.createCompanyAdmin(
        {
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone,
        },
        companyData.adminEmail,
        companyData.adminPassword
      );

      toast.success('Company and admin created successfully');
      
      // Reset form
      setCompanyData({
        name: '',
        email: '',
        phone: '',
        adminEmail: '',
        adminPassword: '',
      });

      return companyId;
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  const handleCoachSubmit = async (e: React.FormEvent, companyId: string) => {
    e.preventDefault();
    setLoading(true);

    try {
      await companySetupService.addCoach(
        {
          name: coachData.name,
          email: coachData.email,
          phone: coachData.phone,
          specialties: coachData.specialties.split(',').map(s => s.trim()),
          certifications: coachData.certifications.split(',').map(c => c.trim()),
          companyId,
        },
        coachData.password
      );

      toast.success('Coach added successfully');
      
      // Reset form
      setCoachData({
        name: '',
        email: '',
        phone: '',
        password: '',
        specialties: '',
        certifications: '',
      });
    } catch (error) {
      console.error('Error adding coach:', error);
      toast.error('Failed to add coach');
    } finally {
      setLoading(false);
    }
  };

  const handleVanaHealthSetup = async () => {
    setLoading(true);
    try {
      const companyData = {
        name: 'Vana Health Pty Ltd',
        email: 'admin@vanahealth.com.au',
        phone: '+61000000000',
        address: {
          street: '123 Health Street',
          city: 'Sydney',
          state: 'NSW',
          postalCode: '2000',
          country: 'Australia'
        },
        subscription: {
          plan: 'professional',
          billingCycle: 'annual'
        }
      };

      const adminEmail = 'admin@vanahealth.com.au';
      const adminPassword = 'VanaHealth2024!'; // This should be changed after first login

      const { companyId } = await companySetupService.createCompanyAdmin(
        companyData,
        adminEmail,
        adminPassword
      );

      // Add Silvana as a coach
      const coachData = {
        name: 'Silvana Earl',
        email: 'silvi@vanahealth.com.au',
        phone: '+61000000000',
        specialties: ['Nutrition', 'Wellness Coaching', 'Health Management'],
        certifications: ['Certified Health Coach', 'Nutrition Specialist'],
        companyId
      };

      await companySetupService.addCoach(coachData, 'CoachSilvi2024!'); // This should be changed after first login

      toast.success('Vana Health setup completed successfully');
      
      // Redirect to the company page
      router.push(`/admin/companies/${companyId}`);
    } catch (error) {
      console.error('Error setting up Vana Health:', error);
      toast.error('Failed to set up Vana Health');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Company Setup</h1>
      
      <div className="flex gap-4 mb-6">
        <Button 
          variant={setupType === 'manual' ? 'default' : 'outline'}
          onClick={() => setSetupType('manual')}
        >
          Manual Setup
        </Button>
        <Button
          variant={setupType === 'vana' ? 'default' : 'outline'}
          onClick={() => setSetupType('vana')}
        >
          Setup Vana Health
        </Button>
      </div>

      {setupType === 'vana' ? (
        <Card>
          <CardHeader>
            <CardTitle>Vana Health Pty Ltd Setup</CardTitle>
            <CardDescription>
              Quick setup for Vana Health with predefined configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleVanaHealthSetup}
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Setup Vana Health'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                Create a new company and admin account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={companyData.adminEmail}
                    onChange={(e) => setCompanyData({...companyData, adminEmail: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={companyData.adminPassword}
                    onChange={(e) => setCompanyData({...companyData, adminPassword: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Company'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Coach</CardTitle>
              <CardDescription>
                Add a coach to an existing company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleCoachSubmit(e, 'companyId')} className="space-y-4">
                <div>
                  <Label htmlFor="coachName">Coach Name</Label>
                  <Input
                    id="coachName"
                    value={coachData.name}
                    onChange={(e) => setCoachData({...coachData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="coachEmail">Coach Email</Label>
                  <Input
                    id="coachEmail"
                    type="email"
                    value={coachData.email}
                    onChange={(e) => setCoachData({...coachData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="coachPhone">Coach Phone</Label>
                  <Input
                    id="coachPhone"
                    value={coachData.phone}
                    onChange={(e) => setCoachData({...coachData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="coachPassword">Password</Label>
                  <Input
                    id="coachPassword"
                    type="password"
                    value={coachData.password}
                    onChange={(e) => setCoachData({...coachData, password: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                  <Input
                    id="specialties"
                    value={coachData.specialties}
                    onChange={(e) => setCoachData({...coachData, specialties: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                  <Input
                    id="certifications"
                    value={coachData.certifications}
                    onChange={(e) => setCoachData({...coachData, certifications: e.target.value})}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Coach'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 