'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface OnboardingFormData {
  // Personal Info
  fullName: string;
  bio: string;
  profileImage?: string;
  
  // Business Info
  businessName: string;
  abn: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    postcode: string;
  };
  businessPhone: string;
  businessEmail: string;
  insuranceDetails: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  
  // Expertise
  specialties: string[];
  experience: string;
  certifications: string[];
  
  // Training Methodology
  trainingStyle: string;
  clientMotivation: string;
  progressTracking: string;
  nutritionPhilosophy: string;
  challengeHandling: string;
  
  // Availability for Notifications
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };

  // Business Hours
  businessHours: {
    [key: string]: {
      isOpen: boolean;
      startTime: string;
      endTime: string;
    };
  };

  // Terms & Conditions
  termsAndConditions: {
    accepted: boolean;
    lastUpdated: string;
    customTerms?: string;
  };
}

export default function CoachOnboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    // Personal Info
    fullName: '',
    bio: '',
    
    // Business Info
    businessName: '',
    abn: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      postcode: '',
    },
    businessPhone: '',
    businessEmail: '',
    insuranceDetails: {
      provider: '',
      policyNumber: '',
      expiryDate: '',
    },
    
    // Expertise
    specialties: [],
    experience: '',
    certifications: [],
    
    // Training Methodology
    trainingStyle: '',
    clientMotivation: '',
    progressTracking: '',
    nutritionPhilosophy: '',
    challengeHandling: '',
    
    // Availability
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },

    // Business Hours
    businessHours: {
      monday: { isOpen: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { isOpen: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { isOpen: true, startTime: '09:00', endTime: '17:00' },
      thursday: { isOpen: true, startTime: '09:00', endTime: '17:00' },
      friday: { isOpen: true, startTime: '09:00', endTime: '17:00' },
      saturday: { isOpen: false, startTime: '09:00', endTime: '17:00' },
      sunday: { isOpen: false, startTime: '09:00', endTime: '17:00' },
    },

    // Terms & Conditions
    termsAndConditions: {
      accepted: false,
      lastUpdated: new Date().toISOString(),
      customTerms: '',
    },
  });

  // Add this constant for coaching specialties
  const COACHING_SPECIALTIES = [
    'Weight Loss',
    'Muscle Building',
    'Sports Performance',
    'Rehabilitation',
    'Nutrition',
    'Mindset',
    'Group Training',
    'Online Coaching',
    'Personal Training',
    'Corporate Wellness',
    'Senior Fitness',
    'Youth Fitness',
    'Pre/Post Natal',
    'Functional Training',
    'Strength Training',
    'Cardio Training',
    'Flexibility & Mobility',
    'Injury Prevention',
    'Lifestyle Coaching',
    'Stress Management'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecialtiesChange = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleAvailabilityChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: !prev.availability[day as keyof typeof prev.availability]
      }
    }));
  };

  const handleBusinessAddressChange = (field: keyof typeof formData.businessAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      businessAddress: {
        ...prev.businessAddress,
        [field]: value
      }
    }));
  };

  const handleInsuranceDetailsChange = (field: keyof typeof formData.insuranceDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      insuranceDetails: {
        ...prev.insuranceDetails,
        [field]: value
      }
    }));
  };

  const handleCertificationsChange = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...prev.certifications, certification]
    }));
  };

  const handleBusinessHoursChange = (day: string, field: 'isOpen' | 'startTime' | 'endTime', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleTermsChange = (field: 'accepted' | 'customTerms', value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      termsAndConditions: {
        ...prev.termsAndConditions,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    try {
      await updateDoc(doc(db, 'coaches', user.uid), {
        name: formData.fullName,
        specialties: formData.specialties,
        experience: formData.experience,
        bio: formData.bio,
        businessName: formData.businessName,
        abn: formData.abn,
        businessAddress: formData.businessAddress,
        businessPhone: formData.businessPhone,
        businessEmail: formData.businessEmail,
        insuranceDetails: formData.insuranceDetails,
        certifications: formData.certifications,
        trainingStyle: formData.trainingStyle,
        clientMotivation: formData.clientMotivation,
        progressTracking: formData.progressTracking,
        nutritionPhilosophy: formData.nutritionPhilosophy,
        challengeHandling: formData.challengeHandling,
        availability: formData.availability,
        businessHours: formData.businessHours,
        termsAndConditions: formData.termsAndConditions,
        onboardingCompleted: true,
        updatedAt: new Date()
      });

      router.push('/coach/dashboard');
    } catch (error) {
      console.error('Error updating coach profile:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tell us about your coaching experience and philosophy..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coaching Specialties
                </label>
                <p className="text-sm text-gray-500 mb-3">Select your areas of expertise</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COACHING_SPECIALTIES.map((specialty) => (
                    <label key={specialty} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(specialty)}
                          onChange={() => handleSpecialtiesChange(specialty)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <span className="font-medium text-gray-700">{specialty}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 2: {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4">Business Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="abn" className="block text-sm font-medium text-gray-700">
                  ABN
                </label>
                <input
                  type="text"
                  id="abn"
                  value={formData.abn}
                  onChange={(e) => handleInputChange('abn', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    value={formData.businessAddress.street}
                    onChange={(e) => handleBusinessAddressChange('street', e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City/Suburb
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.businessAddress.city}
                    onChange={(e) => handleBusinessAddressChange('city', e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <select
                    id="state"
                    value={formData.businessAddress.state}
                    onChange={(e) => handleBusinessAddressChange('state', e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select a state</option>
                    <option value="NSW">New South Wales</option>
                    <option value="VIC">Victoria</option>
                    <option value="QLD">Queensland</option>
                    <option value="WA">Western Australia</option>
                    <option value="SA">South Australia</option>
                    <option value="TAS">Tasmania</option>
                    <option value="ACT">Australian Capital Territory</option>
                    <option value="NT">Northern Territory</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
                    Postcode
                  </label>
                  <input
                    type="text"
                    id="postcode"
                    value={formData.businessAddress.postcode}
                    onChange={(e) => handleBusinessAddressChange('postcode', e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700">
                  Business Phone
                </label>
                <input
                  type="tel"
                  id="businessPhone"
                  value={formData.businessPhone}
                  onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700">
                  Business Email
                </label>
                <input
                  type="email"
                  id="businessEmail"
                  value={formData.businessEmail}
                  onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Insurance Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700">
                      Insurance Provider
                    </label>
                    <input
                      type="text"
                      id="insuranceProvider"
                      value={formData.insuranceDetails.provider}
                      onChange={(e) => handleInsuranceDetailsChange('provider', e.target.value)}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700">
                      Policy Number
                    </label>
                    <input
                      type="text"
                      id="policyNumber"
                      value={formData.insuranceDetails.policyNumber}
                      onChange={(e) => handleInsuranceDetailsChange('policyNumber', e.target.value)}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      id="expiryDate"
                      value={formData.insuranceDetails.expiryDate}
                      onChange={(e) => handleInsuranceDetailsChange('expiryDate', e.target.value)}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
                <p className="text-sm text-gray-500">Set your regular business hours</p>
                
                {Object.entries(formData.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={hours.isOpen}
                        onChange={(e) => handleBusinessHoursChange(day, 'isOpen', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <span className="w-24 text-sm font-medium text-gray-700 capitalize">{day}</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={hours.startTime}
                        onChange={(e) => handleBusinessHoursChange(day, 'startTime', e.target.value)}
                        className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={!hours.isOpen}
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={hours.endTime}
                        onChange={(e) => handleBusinessHoursChange(day, 'endTime', e.target.value)}
                        className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={!hours.isOpen}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 flex justify-between gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 3: {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4">Training Methodology</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  What's your primary training style or methodology?
                </label>
                <textarea
                  value={formData.trainingStyle}
                  onChange={(e) => handleInputChange('trainingStyle', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="E.g., I focus on progressive overload with a mix of compound and isolation exercises..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  How do you typically motivate and keep clients accountable?
                </label>
                <textarea
                  value={formData.clientMotivation}
                  onChange={(e) => handleInputChange('clientMotivation', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="E.g., I use a combination of goal-setting, regular check-ins, and celebration of small wins..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  How do you track and measure client progress?
                </label>
                <textarea
                  value={formData.progressTracking}
                  onChange={(e) => handleInputChange('progressTracking', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="E.g., I use a combination of progress photos, measurements, strength metrics..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  What's your approach to nutrition and diet?
                </label>
                <textarea
                  value={formData.nutritionPhilosophy}
                  onChange={(e) => handleInputChange('nutritionPhilosophy', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="E.g., I believe in flexible dieting with an emphasis on whole foods..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  How do you handle clients who face challenges or setbacks?
                </label>
                <textarea
                  value={formData.challengeHandling}
                  onChange={(e) => handleInputChange('challengeHandling', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="E.g., I focus on identifying the root cause and developing strategies to overcome obstacles..."
                  required
                />
              </div>

              <div className="pt-6 flex justify-between gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 4: {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">When would you like to receive client notifications?</label>
                <p className="mt-1 text-sm text-gray-500">Select the days when you'd like to receive notifications about client updates and messages.</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {Object.keys(formData.availability).map((day) => (
                    <label key={day} className="relative flex items-start py-2">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={formData.availability[day as keyof typeof formData.availability]}
                          onChange={() => handleAvailabilityChange(day)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <span className="font-medium text-gray-700 capitalize">{day}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4">Terms & Conditions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Standard Terms</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        By using our platform, you agree to our standard terms and conditions. These include:
                      </p>
                      <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>Professional conduct and ethical standards</li>
                        <li>Client data protection and privacy</li>
                        <li>Payment and billing terms</li>
                        <li>Service level agreements</li>
                        <li>Intellectual property rights</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Terms</h3>
                    <p className="text-sm text-gray-500 mb-2">Add any additional terms specific to your coaching business</p>
                    <textarea
                      value={formData.termsAndConditions.customTerms}
                      onChange={(e) => handleTermsChange('customTerms', e.target.value)}
                      rows={4}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your custom terms and conditions..."
                    />
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={formData.termsAndConditions.accepted}
                        onChange={(e) => handleTermsChange('accepted', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-medium text-gray-700">
                        I agree to the terms and conditions
                      </label>
                      <p className="text-gray-500">
                        By checking this box, you acknowledge that you have read and agree to our terms and conditions.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between gap-4">
                    <button
                      onClick={() => setStep(3)}
                      className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!formData.termsAndConditions.accepted}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Complete Setup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      default: {
        return null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Your Coach Profile</h1>
          <p className="text-lg text-gray-600">Let's set up your professional profile to help you connect with potential clients.</p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8">
          {renderStep()}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Step {step} of 4: {
              step === 1 ? 'Personal Information' :
              step === 2 ? 'Business Information' :
              step === 3 ? 'Training Methodology' :
              'Notification Preferences'
            }
          </p>
        </div>
      </div>
    </div>
  );
} 