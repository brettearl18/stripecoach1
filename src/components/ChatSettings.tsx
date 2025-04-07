'use client';

import { useState } from 'react';
import { PencilIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Switch } from '@/components/ui/switch';
import { Avatar } from '@/components/ui/avatar';

interface ChatSettingsProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'away';
  };
  onClose: () => void;
}

interface SettingsSection {
  id: string;
  title: string;
  isOpen: boolean;
}

export function ChatSettings({ user, onClose }: ChatSettingsProps) {
  const [sections, setSections] = useState<SettingsSection[]>([
    { id: 'personal', title: 'Personal Info', isOpen: false },
    { id: 'privacy', title: 'Privacy', isOpen: true },
    { id: 'security', title: 'Security', isOpen: false },
    { id: 'help', title: 'Help', isOpen: false },
  ]);

  const [privacySettings, setPrivacySettings] = useState({
    profilePhoto: 'everyone',
    lastSeen: true,
    status: 'everyone',
    readReceipts: true,
    groups: 'everyone',
  });

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section => ({
      ...section,
      isOpen: section.id === sectionId ? !section.isOpen : section.isOpen
    })));
  };

  return (
    <div className="h-screen w-full md:w-[400px] bg-[#2B2D31] text-gray-100 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-8">Settings</h1>
        
        {/* Profile Section */}
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <Avatar
              src={user.avatar}
              fallback={user.name}
              size="lg"
              className="w-24 h-24"
              status={user.status}
            />
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors">
              <PencilIcon className="w-4 h-4 text-white" />
            </button>
          </div>
          <h2 className="mt-4 text-xl font-medium">{user.name}</h2>
          <p className="text-gray-400 capitalize">{user.role}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-gray-400">Available</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-6">
          {sections.map(section => (
            <div key={section.id} className="border-t border-gray-700 pt-4">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between py-2 text-gray-300 hover:text-white"
              >
                <span className="text-lg">{section.title}</span>
                <ChevronDownIcon 
                  className={`w-5 h-5 transition-transform ${
                    section.isOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              
              {section.id === 'privacy' && section.isOpen && (
                <div className="mt-4 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Profile photo</h3>
                        <p className="text-sm text-gray-400">Who can see your profile photo</p>
                      </div>
                      <select 
                        className="bg-gray-700 rounded px-3 py-1 text-sm"
                        value={privacySettings.profilePhoto}
                        onChange={(e) => setPrivacySettings({
                          ...privacySettings,
                          profilePhoto: e.target.value
                        })}
                      >
                        <option value="everyone">Everyone</option>
                        <option value="contacts">Contacts</option>
                        <option value="nobody">Nobody</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Last seen</h3>
                        <p className="text-sm text-gray-400">Show when you were last online</p>
                      </div>
                      <Switch
                        checked={privacySettings.lastSeen}
                        onCheckedChange={(checked) => setPrivacySettings({
                          ...privacySettings,
                          lastSeen: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Status</h3>
                        <p className="text-sm text-gray-400">Who can see your status</p>
                      </div>
                      <select 
                        className="bg-gray-700 rounded px-3 py-1 text-sm"
                        value={privacySettings.status}
                        onChange={(e) => setPrivacySettings({
                          ...privacySettings,
                          status: e.target.value
                        })}
                      >
                        <option value="everyone">Everyone</option>
                        <option value="contacts">Contacts</option>
                        <option value="nobody">Nobody</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Read receipts</h3>
                        <p className="text-sm text-gray-400">Show when you've read messages</p>
                      </div>
                      <Switch
                        checked={privacySettings.readReceipts}
                        onCheckedChange={(checked) => setPrivacySettings({
                          ...privacySettings,
                          readReceipts: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Groups</h3>
                        <p className="text-sm text-gray-400">Who can add you to groups</p>
                      </div>
                      <select 
                        className="bg-gray-700 rounded px-3 py-1 text-sm"
                        value={privacySettings.groups}
                        onChange={(e) => setPrivacySettings({
                          ...privacySettings,
                          groups: e.target.value
                        })}
                      >
                        <option value="everyone">Everyone</option>
                        <option value="contacts">Contacts</option>
                        <option value="nobody">Nobody</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 