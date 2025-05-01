'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Cog6ToothIcon,
  UserGroupIcon,
  UserIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  SwatchIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { getAISettings, saveAISettings } from '@/lib/services/aiSettingsService';
import { useAuth } from '@/hooks/useAuth';
import { AISettings } from '@/lib/types/ai';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { encrypt, decrypt } from '@/lib/utils/encryption';
import { getCommunicationSettings, saveCommunicationSettings, addQuickResponse, removeQuickResponse } from '@/lib/services/communicationsService';
import { CommunicationSettings } from '@/lib/services/communicationsService';
import { useSecuritySettings } from '@/hooks/useSecuritySettings';
import BillingSection from './BillingSection';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const sections = [
  {
    name: 'Platform Settings',
    icon: <Cog6ToothIcon className="h-5 w-5" />,
    description: 'Configure general platform settings and preferences'
  },
  {
    name: 'User Management',
    icon: <UserGroupIcon className="h-5 w-5" />,
    description: 'Manage user roles, permissions and account settings'
  },
  {
    name: 'Coach Settings',
    icon: <UserIcon className="h-5 w-5" />,
    description: 'Configure coach-specific settings and requirements'
  },
  {
    name: 'Client Settings',
    icon: <BuildingOfficeIcon className="h-5 w-5" />,
    description: 'Manage client-related settings and defaults'
  },
  {
    name: 'Billing & Payments',
    icon: <CreditCardIcon className="h-5 w-5" />,
    description: 'Manage subscription, billing, and payment settings'
  },
  {
    name: 'Communication',
    icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
    description: 'Set up notification and messaging preferences'
  },
  {
    name: 'AI Settings',
    icon: <SparklesIcon className="h-5 w-5" />,
    description: 'Configure AI assistant behavior and responses'
  },
  {
    name: 'Security',
    icon: <ShieldCheckIcon className="h-5 w-5" />,
    description: 'Manage security settings and authentication methods'
  }
];

export default function SettingsPage() {
  const { user } = useAuth();
  const {
    settings: securitySettings,
    loading: securityLoading,
    saving: securitySaving,
    updateSettings: updateSecuritySettings,
    resetToDefault: resetSecuritySettings
  } = useSecuritySettings(user?.uid);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedSection, setSelectedSection] = useState(0);
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState('#1E40AF');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const pathname = usePathname();
  const [domain, setDomain] = useState('');
  const [domainError, setDomainError] = useState('');
  const [dnsRecords, setDnsRecords] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [aiSettings, setAiSettings] = useState<Partial<AISettings>>({
    businessTone: 'professional',
    communicationStyle: 'direct',
    keyBrandMessages: [],
    specificGuidelines: '',
    targetAudience: '',
    industryContext: ''
  });
  const [newMessage, setNewMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [openAIKey, setOpenAIKey] = useState('');
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [apiStatus, setApiStatus] = useState<'untested' | 'valid' | 'invalid'>('untested');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [communicationSettings, setCommunicationSettings] = useState<Partial<CommunicationSettings>>({
    messaging: {
      defaultResponseTime: 60,
      messageRetentionPeriod: 90,
      fileUploadLimits: {
        maxFileSize: 10,
        allowedTypes: ['pdf', 'doc', 'jpg', 'png']
      }
    },
    notifications: {
      push: {
        newMessages: true,
        messageReactions: true,
        fileUploads: true
      },
      email: {
        messageSummaries: true,
        importantUpdates: true
      }
    },
    autoResponse: {
      enabled: false,
      outsideBusinessHours: true,
      highMessageVolume: false,
      defaultMessage: "Thank you for your message. We'll get back to you as soon as possible.",
      businessHours: {
        start: "09:00",
        end: "17:00"
      }
    },
    templates: {
      quickResponses: []
    }
  });
  const [newQuickResponse, setNewQuickResponse] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleDomainChange = (value: string) => {
    setDomain(value);
    setDomainError('');
    // Reset verification status when domain changes
    setVerificationStatus('');
    setDnsRecords([]);
  };

  const handleVerifyDomain = async () => {
    try {
      const response = await fetch('/api/settings/domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });

        const data = await response.json();

      if (!response.ok) {
        setDomainError(data.error);
        setVerificationStatus('failed');
        return;
      }

      // Set DNS records for user to configure
      setDnsRecords(data.requiredRecords);
      setVerificationStatus('pending');
      
      // Show success message
      toast.success('Please configure your DNS records to complete verification');

      } catch (error) {
      console.error('Error verifying domain:', error);
      setDomainError('Failed to verify domain. Please try again.');
      setVerificationStatus('failed');
    }
  };

  const handleRemoveDomain = async () => {
    try {
      const response = await fetch('/api/settings/domain', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove domain');
      }

      // Reset all domain-related state
      setDomain('');
      setDnsRecords([]);
      setVerificationStatus('');
      toast.success('Domain removed successfully');

    } catch (error) {
      console.error('Error removing domain:', error);
      toast.error('Failed to remove domain');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  useEffect(() => {
    if (user?.uid && selectedSection === 6) {
      loadAISettings();
    }
  }, [user, selectedSection]);

  const loadAISettings = async () => {
    try {
      const settings = await getAISettings(user!.uid);
      if (settings) {
        setAiSettings(settings);
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
      setSaveMessage({ type: 'error', text: 'Failed to load AI settings' });
    }
  };

  const handleAISettingChange = (field: keyof AISettings, value: any) => {
    setAiSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      setAiSettings(prev => ({
        ...prev,
        keyBrandMessages: [...(prev.keyBrandMessages || []), newMessage.trim()]
      }));
      setNewMessage('');
    }
  };

  const handleRemoveMessage = (index: number) => {
    setAiSettings(prev => ({
      ...prev,
      keyBrandMessages: prev.keyBrandMessages?.filter((_, i) => i !== index)
    }));
  };

  const handleSaveAISettings = async () => {
    if (!user?.uid) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      await saveAISettings(user.uid, aiSettings);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving AI settings:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAISettings = () => {
    setAiSettings({
      businessTone: 'professional',
      communicationStyle: 'direct',
      keyBrandMessages: [],
      specificGuidelines: '',
      targetAudience: '',
      industryContext: ''
    });
  };

  // Load OpenAI key on component mount
  useEffect(() => {
    if (user?.uid) {
      loadOpenAIKey();
    }
  }, [user]);

  const loadOpenAIKey = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', user!.uid));
      if (settingsDoc.exists() && settingsDoc.data().openAIKey) {
        const decryptedKey = decrypt(settingsDoc.data().openAIKey);
        setOpenAIKey(decryptedKey);
      }
    } catch (error) {
      console.error('Error loading OpenAI key:', error);
      toast.error('Failed to load API key');
    }
  };

  const handleUpdateAPIKey = async () => {
    if (!user?.uid || !openAIKey) return;

    setIsSavingKey(true);
    try {
      const encryptedKey = encrypt(openAIKey);
      await setDoc(doc(db, 'settings', user.uid), {
        openAIKey: encryptedKey,
        updatedAt: new Date()
      }, { merge: true });

      toast.success('API key updated successfully');
      setApiStatus('untested');
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to update API key');
    } finally {
      setIsSavingKey(false);
    }
  };

  const testAPIConnection = async () => {
    if (!openAIKey) {
      toast.error('Please enter an API key first');
      return;
    }

    setIsTestingAPI(true);
    try {
      const response = await fetch('/api/settings/test-openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: openAIKey }),
      });

      if (response.ok) {
        setApiStatus('valid');
        toast.success('API key is valid');
      } else {
        setApiStatus('invalid');
        toast.error('Invalid API key');
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setApiStatus('invalid');
      toast.error('Failed to test API key');
    } finally {
      setIsTestingAPI(false);
    }
  };

  const viewUsage = () => {
    window.open('https://platform.openai.com/usage', '_blank');
  };

  useEffect(() => {
    if (user?.uid && selectedSection === 5) {
      loadCommunicationSettings();
    }
  }, [user, selectedSection]);

  const loadCommunicationSettings = async () => {
    try {
      const settings = await getCommunicationSettings(user!.uid);
      if (settings) {
        setCommunicationSettings(settings);
      }
    } catch (error) {
      console.error('Error loading communication settings:', error);
      setSaveMessage({ type: 'error', text: 'Failed to load settings' });
    }
  };

  const handleSaveCommunicationSettings = async () => {
    if (!user?.uid) return;
    
    setIsSavingSettings(true);
    try {
      await saveCommunicationSettings(user.uid, communicationSettings);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving communication settings:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddQuickResponse = async () => {
    if (!user?.uid || !newQuickResponse.trim()) return;
    
    try {
      await addQuickResponse(user.uid, newQuickResponse.trim());
      setCommunicationSettings(prev => ({
        ...prev,
        templates: {
          ...prev.templates,
          quickResponses: [...(prev.templates?.quickResponses || []), newQuickResponse.trim()]
        }
      }));
      setNewQuickResponse('');
    } catch (error) {
      console.error('Error adding quick response:', error);
      setSaveMessage({ type: 'error', text: 'Failed to add quick response' });
    }
  };

  const handleRemoveQuickResponse = async (response: string) => {
    if (!user?.uid) return;
    
    try {
      await removeQuickResponse(user.uid, response);
      setCommunicationSettings(prev => ({
        ...prev,
        templates: {
          ...prev.templates,
          quickResponses: prev.templates?.quickResponses.filter(r => r !== response) || []
        }
      }));
    } catch (error) {
      console.error('Error removing quick response:', error);
      setSaveMessage({ type: 'error', text: 'Failed to remove quick response' });
    }
  };

  // Add security settings handlers
  const handleSecuritySettingChange = (category: string, subcategory: string | null, field: string, value: any) => {
    if (!securitySettings) return;

    const newSettings = { ...securitySettings };
    if (subcategory) {
      newSettings[category][subcategory][field] = value;
    } else {
      newSettings[category][field] = value;
    }
    updateSecuritySettings(newSettings);
  };

  const handleResetSecuritySettings = async () => {
    if (window.confirm('Are you sure you want to reset all security settings to default values? This action cannot be undone.')) {
      await resetSecuritySettings();
      toast.success('Security settings have been reset to default values');
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 0: // Platform Settings
  return (
          <div className="space-y-8">
            {/* Platform Identity */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Platform Identity</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Platform Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    placeholder="Enter platform name"
                  />
                  <p className="mt-2 text-sm text-gray-400">This name will appear throughout the platform</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Platform Description</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    placeholder="Enter a brief description of your platform"
                  />
                  <p className="mt-2 text-sm text-gray-400">This description appears in various places including the login page</p>
                </div>
              </div>
            </div>

            {/* Logo Settings */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Logo Settings</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Platform Logo</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="h-24 w-24 rounded-lg border border-gray-700 bg-[#13141A] flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-500" />
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Upload Logo
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">Recommended size: 512x512px. PNG or SVG format.</p>
        </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Favicon</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-lg border border-gray-700 bg-[#13141A] flex items-center justify-center">
                      <PhotoIcon className="h-6 w-6 text-gray-500" />
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Upload Favicon
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">Recommended size: 32x32px. ICO or PNG format.</p>
                </div>
              </div>
            </div>

            {/* OpenAI API Key section */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">AI Integration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    OpenAI API Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={openAIKey}
                      onChange={(e) => setOpenAIKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-[#13141A] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24"
                    />
                    <button
                      type="button"
                      onClick={handleUpdateAPIKey}
                      disabled={isSavingKey}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    >
                      {isSavingKey ? 'Saving...' : 'Update'}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    Your API key will be encrypted and stored securely. Get your API key from{' '}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:text-blue-300"
                    >
                      OpenAI's platform
                    </a>
                  </p>
            </div>

                <div className="flex items-center justify-between p-4 bg-[#1E1F25] rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-white">API Key Status</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {apiStatus === 'untested' && 'Key not tested yet'}
                      {apiStatus === 'valid' && 'Key is valid'}
                      {apiStatus === 'invalid' && 'Key is invalid'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={testAPIConnection}
                    disabled={isTestingAPI || !openAIKey}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isTestingAPI ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#1E1F25] rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-white">Usage Monitoring</h4>
                    <p className="text-sm text-gray-400 mt-1">Monitor your OpenAI API usage and costs</p>
                  </div>
                  <button
                    type="button"
                    onClick={viewUsage}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Usage
                  </button>
                </div>
              </div>
            </div>

            {/* Domain Settings */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Domain Settings</h3>
            <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Custom Domain</label>
                  <div className="mt-1">
                    <div className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-700 bg-[#1a1b1e] text-gray-400 sm:text-sm">
                        https://
                      </span>
                      <input
                        type="text"
                        className="flex-1 block w-full rounded-none rounded-r-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                        placeholder="yourdomain.com"
                        onChange={(e) => handleDomainChange(e.target.value)}
                      />
                    </div>
                    {domainError && (
                      <p className="mt-2 text-sm text-red-500">{domainError}</p>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-400">Enter your custom domain if you want to use one</p>
                </div>

                {/* DNS Configuration Instructions */}
                {dnsRecords && (
                  <div className="rounded-md bg-[#1a1b1e] p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-white mb-3">Required DNS Records</h4>
                    <div className="space-y-3">
                      {dnsRecords.map((record, index) => (
                        <div key={index} className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{record.type} Record</span>
                            <button
                              onClick={() => copyToClipboard(record.value)}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="text-xs bg-[#13141A] rounded p-2 font-mono text-gray-300">
                            <span className="text-gray-500">Name:</span> {record.name}<br />
                            <span className="text-gray-500">Value:</span> {record.value}<br />
                            <span className="text-gray-500">TTL:</span> {record.ttl}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-gray-400">
                      After configuring these records, it may take up to 48 hours for DNS changes to propagate.
                    </p>
                  </div>
                )}

                {/* Verification Status */}
                {verificationStatus && (
                  <div className={`rounded-md p-4 ${
                    verificationStatus === 'verified' 
                      ? 'bg-green-900/20 border-green-900' 
                      : verificationStatus === 'pending' 
                        ? 'bg-yellow-900/20 border-yellow-900'
                        : 'bg-red-900/20 border-red-900'
                  } border`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {verificationStatus === 'verified' ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        ) : verificationStatus === 'pending' ? (
                          <ClockIcon className="h-5 w-5 text-yellow-400" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-400" />
                        )}
                    </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-white">
                          {verificationStatus === 'verified'
                            ? 'Domain Verified'
                            : verificationStatus === 'pending'
                            ? 'Verification Pending'
                            : 'Verification Failed'}
                        </h3>
                        <div className="mt-2 text-sm text-gray-300">
                          {verificationStatus === 'verified' ? (
                            <p>Your domain is properly configured and SSL is active.</p>
                          ) : verificationStatus === 'pending' ? (
                            <p>Please complete DNS configuration and wait for verification.</p>
                          ) : (
                            <p>There was an error verifying your domain. Please check your DNS configuration.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                    <button
                    onClick={handleVerifyDomain}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={!domain || verificationStatus === 'verified'}
                  >
                    {verificationStatus === 'pending' ? 'Check Status' : 'Verify Domain'}
                  </button>
                  {verificationStatus === 'verified' && (
                    <button
                      onClick={handleRemoveDomain}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-300 hover:text-red-200 focus:outline-none"
                    >
                      Remove Domain
                    </button>
                  )}
                </div>
              </div>
                </div>

            {/* Brand Colors Section */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Brand Colors</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Primary Color</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-8 w-8 rounded border border-gray-700 bg-[#13141A] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      placeholder="#000000"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-400">Used for primary buttons and key UI elements</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Secondary Color</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-8 w-8 rounded border border-gray-700 bg-[#13141A] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      placeholder="#000000"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-400">Used for secondary buttons and accents</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Accent Color</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-8 w-8 rounded border border-gray-700 bg-[#13141A] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      placeholder="#000000"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-400">Used for highlights and special elements</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Platform Settings
              </button>
            </div>
          </div>
        );
      case 1: // User Management
        return (
          <div className="space-y-8">
            {/* Header with Search and Filters */}
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-lg">
                <label htmlFor="search" className="sr-only">Search users</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="search"
                    name="search"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-md leading-5 bg-[#13141A] text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-[#13141A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Search users..."
                  />
                </div>
              </div>
              <div className="ml-6 flex items-center space-x-4">
                <select className="block w-full pl-3 pr-10 py-2 border border-gray-800 rounded-md leading-5 bg-[#13141A] text-gray-300 focus:outline-none focus:bg-[#13141A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option>All Roles</option>
                  <option>Administrator</option>
                  <option>Coach</option>
                  <option>Client</option>
                </select>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Add User
                </button>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-[#13141A] rounded-lg border border-gray-800 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-[#1a1b1e]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                          <span className="text-lg text-white">JD</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">John Doe</div>
                          <div className="text-sm text-gray-400">john@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Administrator
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      2 minutes ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <button className="text-blue-500 hover:text-blue-400 mr-3">Edit</button>
                      <button className="text-red-500 hover:text-red-400">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                          <span className="text-lg text-white">JS</span>
                      </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">Jane Smith</div>
                          <div className="text-sm text-gray-400">jane@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Coach
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      5 hours ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <button className="text-blue-500 hover:text-blue-400 mr-3">Edit</button>
                      <button className="text-red-500 hover:text-red-400">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                          <span className="text-lg text-white">RJ</span>
                      </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">Robert Johnson</div>
                          <div className="text-sm text-gray-400">robert@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Client
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Inactive
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      2 days ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <button className="text-blue-500 hover:text-blue-400 mr-3">Edit</button>
                      <button className="text-red-500 hover:text-red-400">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-800 text-sm font-medium rounded-md text-gray-400 bg-[#13141A] hover:bg-gray-800">
                  Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-800 text-sm font-medium rounded-md text-gray-400 bg-[#13141A] hover:bg-gray-800">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                    <span className="font-medium">97</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-800 bg-[#13141A] text-sm font-medium text-gray-400 hover:bg-gray-800">
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-800 bg-[#13141A] text-sm font-medium text-gray-400 hover:bg-gray-800">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-800 bg-blue-600 text-sm font-medium text-white">
                      2
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-800 bg-[#13141A] text-sm font-medium text-gray-400 hover:bg-gray-800">
                      3
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-800 bg-[#13141A] text-sm font-medium text-gray-400 hover:bg-gray-800">
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        );
      case 2: // Coach Settings
        return (
          <div className="space-y-8">
            {/* Qualification Requirements */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Qualification Requirements</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-t border-gray-800">
                  <div>
                    <h4 className="text-sm font-medium text-white">Certification Required</h4>
                    <p className="text-sm text-gray-400">Require coaches to upload certification documents</p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                      </div>
                    </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-800">
                  <div>
                    <h4 className="text-sm font-medium text-white">Background Check</h4>
                    <p className="text-sm text-gray-400">Require background verification for coaches</p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-800">
                  <div>
                    <h4 className="text-sm font-medium text-white">Experience Verification</h4>
                    <p className="text-sm text-gray-400">Verify previous coaching experience</p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Settings */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Session Settings</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Session Duration
                  </label>
                  <select className="w-full bg-[#13141A] border border-gray-800 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Buffer Time Between Sessions
                  </label>
                  <select className="w-full bg-[#13141A] border border-gray-800 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="0">No buffer</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum Daily Sessions
                  </label>
                  <input
                    type="number"
                    className="w-full bg-[#13141A] border border-gray-800 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter maximum sessions"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Advance Booking Window
                  </label>
                  <select className="w-full bg-[#13141A] border border-gray-800 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="7">1 week</option>
                    <option value="14">2 weeks</option>
                    <option value="30">1 month</option>
                    <option value="60">2 months</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Commission */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Pricing & Commission</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Hourly Rate
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
                    <input
                      type="number"
                      className="w-full bg-[#13141A] border border-gray-800 rounded-md pl-8 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platform Commission (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-[#13141A] border border-gray-800 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter percentage"
                      min="0"
                      max="100"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-5">
              <div className="flex justify-end">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      case 3: // Client Settings
        return (
          <div className="space-y-8">
            {/* Global Client Settings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Global Client Settings</h3>
                <span className="text-sm text-gray-400">Default settings for all clients</span>
              </div>
              
              {/* Default Client Preferences */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Default Client Preferences</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Default Session Duration</label>
                    <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Default Communication Method</label>
                    <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="in-app">In-App Messages</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Check-in Settings */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Check-in Settings</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Default Check-in Frequency</label>
                    <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Reminder Timing</label>
                    <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                      <option value="1">1 day before</option>
                      <option value="2">2 days before</option>
                      <option value="3">3 days before</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Session Management */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Session Management</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Booking Window</label>
                    <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                      <option value="1">1 week in advance</option>
                      <option value="2">2 weeks in advance</option>
                      <option value="4">1 month in advance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Cancellation Policy</label>
                    <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                      <option value="24">24 hours notice</option>
                      <option value="48">48 hours notice</option>
                      <option value="72">72 hours notice</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Privacy & Data Settings */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Privacy & Data Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-300">
                      Allow clients to control profile visibility
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-300">
                      Enable progress sharing between clients
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-300">
                      Allow session recording by default
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Client-Specific Settings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Client-Specific Settings</h3>
                      <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                  Add Client Override
                      </button>
                    </div>

              {/* Client Search */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-[#13141A] text-white placeholder-gray-400 focus:outline-none focus:bg-[#13141A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="Search clients..."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Client Settings List */}
              <div className="bg-[#13141A] rounded-lg border border-gray-800 divide-y divide-gray-800">
                {/* Example Client 1 */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-lg text-white">JD</span>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-white">John Doe</h4>
                        <p className="text-sm text-gray-400">john@example.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">Edit</button>
                      <button className="text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                      <span className="text-xs text-gray-400">Check-in Frequency</span>
                      <p className="text-sm text-white">Daily</p>
                      </div>
                    <div>
                      <span className="text-xs text-gray-400">Session Duration</span>
                      <p className="text-sm text-white">45 minutes</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Communication</span>
                      <p className="text-sm text-white">Email + SMS</p>
                    </div>
                  </div>
                </div>

                {/* Example Client 2 */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-lg text-white">JS</span>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-white">Jane Smith</h4>
                        <p className="text-sm text-gray-400">jane@example.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">Edit</button>
                      <button className="text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <span className="text-xs text-gray-400">Check-in Frequency</span>
                      <p className="text-sm text-white">Weekly</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Session Duration</span>
                      <p className="text-sm text-white">60 minutes</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Communication</span>
                      <p className="text-sm text-white">In-App Only</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Client Settings Modal - To be implemented */}
              {/* This will be a modal component for adding/editing client-specific settings */}
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save All Settings
              </button>
                    </div>
          </div>
        );
      case 4: // Billing & Payments
        return <BillingSection />;
      case 5: // Communication
        return (
          <div className="space-y-6">
            {saveMessage && (
              <div className={`p-4 rounded-lg ${
                saveMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {saveMessage.text}
              </div>
            )}

            {/* Messaging Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Messaging Settings</h2>
                  <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Response Time
                  </label>
                  <select 
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    value={communicationSettings.messaging?.defaultResponseTime}
                    onChange={(e) => setCommunicationSettings(prev => ({
                      ...prev,
                      messaging: {
                        ...prev.messaging,
                        defaultResponseTime: Number(e.target.value)
                      }
                    }))}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                      </select>
                    </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message Retention Period
                  </label>
                  <select 
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    value={communicationSettings.messaging?.messageRetentionPeriod}
                    onChange={(e) => setCommunicationSettings(prev => ({
                      ...prev,
                      messaging: {
                        ...prev.messaging,
                        messageRetentionPeriod: Number(e.target.value)
                      }
                    }))}
                  >
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    File Upload Limits
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max File Size (MB)</label>
                      <input
                        type="number"
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        value={communicationSettings.messaging?.fileUploadLimits?.maxFileSize}
                        onChange={(e) => setCommunicationSettings(prev => ({
                          ...prev,
                          messaging: {
                            ...prev.messaging,
                            fileUploadLimits: {
                              ...prev.messaging?.fileUploadLimits,
                              maxFileSize: Number(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Allowed Types</label>
                      <input 
                        type="text" 
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        value={communicationSettings.messaging?.fileUploadLimits?.allowedTypes.join(', ')}
                        onChange={(e) => setCommunicationSettings(prev => ({
                          ...prev,
                          messaging: {
                            ...prev.messaging,
                            fileUploadLimits: {
                              ...prev.messaging?.fileUploadLimits,
                              allowedTypes: e.target.value.split(',').map(type => type.trim())
                            }
                          }
                        }))}
                        placeholder="pdf, doc, jpg, png"
                      />
                  </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Notification Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Push Notifications
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={communicationSettings.notifications?.push?.newMessages}
                        onChange={(e) => setCommunicationSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            push: {
                              ...prev.notifications?.push,
                              newMessages: e.target.checked
                            }
                          }
                        }))}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">New messages</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={communicationSettings.notifications?.push?.messageReactions}
                        onChange={(e) => setCommunicationSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            push: {
                              ...prev.notifications?.push,
                              messageReactions: e.target.checked
                            }
                          }
                        }))}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Message reactions</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={communicationSettings.notifications?.push?.fileUploads}
                        onChange={(e) => setCommunicationSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            push: {
                              ...prev.notifications?.push,
                              fileUploads: e.target.checked
                            }
                          }
                        }))}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">File uploads</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Notifications
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={communicationSettings.notifications?.email?.messageSummaries}
                        onChange={(e) => setCommunicationSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: {
                              ...prev.notifications?.email,
                              messageSummaries: e.target.checked
                            }
                          }
                        }))}
                      />
                      <span className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Message summaries</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={communicationSettings.notifications?.email?.importantUpdates}
                        onChange={(e) => setCommunicationSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: {
                              ...prev.notifications?.email,
                              importantUpdates: e.target.checked
                            }
                          }
                        }))}
                      />
                      <span className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Important updates</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-Response Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Auto-Response Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Enable Auto-Responses
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={communicationSettings.autoResponse?.outsideBusinessHours}
                        onChange={(e) => setCommunicationSettings(prev => ({
                          ...prev,
                          autoResponse: {
                            ...prev.autoResponse,
                            outsideBusinessHours: e.target.checked
                          }
                        }))}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Outside business hours</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={communicationSettings.autoResponse?.highMessageVolume}
                        onChange={(e) => setCommunicationSettings(prev => ({
                          ...prev,
                          autoResponse: {
                            ...prev.autoResponse,
                            highMessageVolume: e.target.checked
                          }
                        }))}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">High message volume</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Auto-Response Message
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    value={communicationSettings.autoResponse?.defaultMessage}
                    onChange={(e) => setCommunicationSettings(prev => ({
                      ...prev,
                      autoResponse: {
                        ...prev.autoResponse,
                        defaultMessage: e.target.value
                      }
                    }))}
                    placeholder="Thank you for your message. We'll get back to you as soon as possible."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Hours
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Time</label>
                      <input 
                        type="time" 
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        value={communicationSettings.autoResponse?.businessHours?.start}
                        onChange={(e) => setCommunicationSettings(prev => ({
                          ...prev,
                          autoResponse: {
                            ...prev.autoResponse,
                            businessHours: {
                              ...prev.autoResponse?.businessHours,
                              start: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Time</label>
                      <input 
                        type="time" 
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        value={communicationSettings.autoResponse?.businessHours?.end}
                        onChange={(e) => setCommunicationSettings(prev => ({
                          ...prev,
                          autoResponse: {
                            ...prev.autoResponse,
                            businessHours: {
                              ...prev.autoResponse?.businessHours,
                              end: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Templates */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Message Templates</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quick Responses
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter quick response"
                        value={newQuickResponse}
                        onChange={(e) => setNewQuickResponse(e.target.value)}
                      />
                      <button 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        onClick={handleAddQuickResponse}
                        disabled={!newQuickResponse.trim()}
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {communicationSettings.templates?.quickResponses?.map((response, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{response}</span>
                          <button 
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleRemoveQuickResponse(response)}
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                onClick={handleSaveCommunicationSettings}
                disabled={isSavingSettings}
              >
                {isSavingSettings ? 'Saving...' : 'Save Communication Settings'}
              </button>
            </div>
          </div>
        );
      case 6: // AI Settings
        return (
          <div className="space-y-8">
            {saveMessage && (
              <div className={`p-4 rounded-lg ${
                saveMessage.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
              }`}>
                {saveMessage.text}
              </div>
            )}
            
                      <div>
              <h3 className="text-lg font-medium text-white mb-4">AI Communication Settings</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Tone
                  </label>
                  <select 
                    value={aiSettings.businessTone}
                    onChange={(e) => handleAISettingChange('businessTone', e.target.value)}
                    className="w-full bg-[#13141A] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="motivational">Motivational</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                      </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Communication Style
                  </label>
                  <select 
                    value={aiSettings.communicationStyle}
                    onChange={(e) => handleAISettingChange('communicationStyle', e.target.value)}
                    className="w-full bg-[#13141A] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="direct">Direct</option>
                    <option value="empathetic">Empathetic</option>
                    <option value="encouraging">Encouraging</option>
                    <option value="technical">Technical</option>
                    <option value="simple">Simple</option>
                  </select>
                    </div>
              </div>
            </div>

                      <div>
              <h3 className="text-lg font-medium text-white mb-4">Key Brand Messages</h3>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Add a key brand message"
                    className="w-full bg-[#13141A] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMessage}
                    className="self-end px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300"
                  >
                    + Add Message
                  </button>
                      </div>
                
                <div className="bg-[#13141A] rounded-lg border border-gray-800">
                  {aiSettings.keyBrandMessages?.map((message, index) => (
                    <div key={index} className={`p-4 ${
                      index !== aiSettings.keyBrandMessages!.length - 1 ? 'border-b border-gray-800' : ''
                    }`}>
                      <div className="flex items-center justify-between">
                        <p className="text-white">{message}</p>
                        <button 
                          onClick={() => handleRemoveMessage(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                    </div>
                  </div>
                  ))}
                  {aiSettings.keyBrandMessages?.length === 0 && (
                    <div className="p-4 text-gray-500 text-center">
                      No brand messages added yet
                  </div>
                )}
                </div>
              </div>
              </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Additional Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Specific Guidelines
                  </label>
                  <textarea
                    value={aiSettings.specificGuidelines}
                    onChange={(e) => handleAISettingChange('specificGuidelines', e.target.value)}
                    rows={4}
                    placeholder="Enter specific guidelines for AI communication..."
                    className="w-full bg-[#13141A] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={aiSettings.targetAudience}
                    onChange={(e) => handleAISettingChange('targetAudience', e.target.value)}
                    placeholder="Describe your target audience..."
                    className="w-full bg-[#13141A] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry Context
                  </label>
                  <input
                    type="text"
                    value={aiSettings.industryContext}
                    onChange={(e) => handleAISettingChange('industryContext', e.target.value)}
                    placeholder="Describe your industry context..."
                    className="w-full bg-[#13141A] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleResetAISettings}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={handleSaveAISettings}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        );
      case 7: // Security
        return (
          <div className="space-y-8">
            {/* Authentication Settings */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Authentication Settings</h3>
              <div className="space-y-6">
                {/* Password Requirements */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Password Requirements</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Minimum Password Length</label>
                      <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                        <option value="8">8 characters</option>
                        <option value="10">10 characters</option>
                        <option value="12">12 characters</option>
                        <option value="14">14 characters</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-300">Require uppercase letters</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-300">Require numbers</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-300">Require special characters</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Session Settings */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Session Security</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Session Timeout</label>
                      <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Max Login Attempts</label>
                      <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                        <option value="3">3 attempts</option>
                        <option value="5">5 attempts</option>
                        <option value="10">10 attempts</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Two-Factor Authentication (2FA)</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">Require 2FA</h4>
                    <p className="text-sm text-gray-400">Enforce two-factor authentication for all users</p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">2FA Method</label>
                    <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                      <option value="authenticator">Authenticator App</option>
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">2FA Expiry</label>
                    <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                      <option value="24">24 hours</option>
                      <option value="72">3 days</option>
                      <option value="168">7 days</option>
                      <option value="720">30 days</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Data Security</h3>
              <div className="space-y-4">
                {/* Encryption Settings */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Encryption</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-300">Enable end-to-end encryption for messages</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-300">Encrypt file uploads</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-300">Enable secure key rotation</span>
                    </label>
                  </div>
                </div>

                {/* Data Retention */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Data Retention</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Message Retention</label>
                      <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                        <option value="365">1 year</option>
                        <option value="forever">Forever</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">File Retention</label>
                      <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                        <option value="365">1 year</option>
                        <option value="forever">Forever</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Access Control */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Access Control</h3>
              <div className="space-y-4">
                {/* IP Restrictions */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">IP Restrictions</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-300">Enable IP whitelisting</span>
                    </label>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-300">Allowed IP Addresses</label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                        placeholder="Enter IP addresses (one per line)"
                      />
                    </div>
                  </div>
                </div>

                {/* Role-Based Access */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Role Permissions</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Admin Access</h5>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-300">Full system access</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-300">User management</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-300">Security settings</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Coach Access</h5>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-300">Client management</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-300">Session scheduling</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-300">Resource access</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Client Access</h5>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-300">Profile management</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-300">Session booking</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-300">Resource viewing</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Logging */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Audit Logging</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">Enable Audit Logging</h4>
                    <p className="text-sm text-gray-400">Track all security-related events</p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="ml-2 text-sm text-gray-300">Log authentication attempts</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="ml-2 text-sm text-gray-300">Log data access</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#13141A] text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="ml-2 text-sm text-gray-300">Log configuration changes</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Log Retention</label>
                  <select className="mt-1 block w-full rounded-md border border-gray-700 bg-[#13141A] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2">
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6">
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Security Settings
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Configure and manage your platform settings</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {sections.map((section, index) => (
                <button
                  key={section.name}
                  onClick={() => setSelectedSection(index)}
                  className={classNames(
                    selectedSection === index
                      ? 'bg-[#1a1b1e] text-white border-blue-500'
                      : 'text-gray-400 hover:bg-[#1a1b1e] hover:text-gray-300',
                    'group flex items-center w-full px-4 py-3 text-sm font-medium rounded-md border-l-4 border-transparent'
                  )}
                >
                  <span className={classNames(
                    selectedSection === index ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300',
                    'mr-3'
                  )}>
                    {section.icon}
                  </span>
                  <div className="flex flex-col items-start">
                    <span>{section.name}</span>
                    <span className="text-xs text-gray-500">{section.description}</span>
              </div>
                </button>
              ))}
              <Link
                href="/admin/settings/usermanagement"
                className={classNames(
                  pathname === '/admin/settings/usermanagement'
                    ? 'bg-[#1a1b1e] text-white border-blue-500'
                    : 'text-gray-400 hover:bg-[#1a1b1e] hover:text-gray-300',
                  'group flex items-center w-full px-4 py-3 text-sm font-medium rounded-md border-l-4 border-transparent'
                )}
              >
                <span className={classNames(
                  pathname === '/admin/settings/usermanagement' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300',
                  'mr-3'
                )}>
                  <UserGroupIcon className="h-5 w-5" />
                </span>
                <div className="flex flex-col items-start">
                  <span>User Management</span>
                  <span className="text-xs text-gray-500">Manage user roles, permissions and account settings</span>
            </div>
              </Link>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-[#1a1b1e] rounded-lg border border-gray-800 p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 