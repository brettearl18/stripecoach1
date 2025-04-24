'use client';

import { useState } from 'react';
import {
  UserCircleIcon,
  CameraIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ScaleIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

// Unit conversion functions
const convertWeight = (value: string, fromUnit: 'lbs' | 'kg'): string => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;
  if (fromUnit === 'lbs') {
    return (numValue * 0.453592).toFixed(1);
  }
  return (numValue * 2.20462).toFixed(1);
};

const convertHeight = (value: string, fromUnit: 'ft' | 'cm'): string => {
  // Convert from "5'10\"" format to cm or vice versa
  if (fromUnit === 'ft') {
    const matches = value.match(/(\d+)'(\d+)"/);
    if (!matches) return value;
    const feet = parseInt(matches[1]);
    const inches = parseInt(matches[2]);
    const totalCm = (feet * 30.48) + (inches * 2.54);
    return totalCm.toFixed(1);
  } else {
    const cm = parseFloat(value);
    if (isNaN(cm)) return value;
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }
};

// Mock user profile data with unit-aware measurements
const mockUserProfile = {
  name: "David Rodriguez",
  email: "david.rodriguez@example.com",
  avatar: null,
  phone: "+1 (555) 123-4567",
  timezone: "America/Los_Angeles",
  goals: [
    "Lose 20 pounds",
    "Improve strength",
    "Better nutrition habits"
  ],
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    communicationPreference: "email",
    workoutReminders: true,
    units: 'imperial' as 'imperial' | 'metric'
  },
  measurements: {
    imperial: {
      weight: "185",
      height: "5'10\"",
      bodyFat: "22%",
    },
    metric: {
      weight: "83.9",
      height: "177.8",
      bodyFat: "22%",
    }
  },
  dietaryRestrictions: [
    "Gluten-free",
    "No dairy"
  ]
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockUserProfile);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  const toggleUnits = () => {
    const newUnit = profile.preferences.units === 'imperial' ? 'metric' : 'imperial';
    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        units: newUnit
      }
    });
  };

  const currentMeasurements = profile.measurements[profile.preferences.units];
  const measurementUnits = {
    weight: profile.preferences.units === 'imperial' ? 'lbs' : 'kg',
    height: profile.preferences.units === 'imperial' ? 'ft' : 'cm',
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isEditing
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
            disabled={isSaving}
          >
            {isEditing ? (
              <>
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5" />
                )}
                Save Changes
              </>
            ) : (
              <>
                <PencilSquareIcon className="w-5 h-5" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Profile Content */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
            <div className="flex items-start gap-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-medium text-white overflow-hidden">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-20 h-20 text-gray-500" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors">
                    <CameraIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Timezone
                    </label>
                    <select
                      value={profile.timezone}
                      onChange={(e) =>
                        setProfile({ ...profile, timezone: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                    >
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/New_York">Eastern Time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Measurement Preferences */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Measurement Preferences</h2>
              <button
                onClick={toggleUnits}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white"
                disabled={!isEditing}
              >
                <ArrowsRightLeftIcon className="w-5 h-5" />
                {profile.preferences.units === 'imperial' ? 'Switch to Metric' : 'Switch to Imperial'}
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <ScaleIcon className="w-5 h-5" />
              <span>Currently using {profile.preferences.units} units</span>
            </div>
          </div>

          {/* Measurements */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">Measurements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Weight ({measurementUnits.weight})
                </label>
                <input
                  type="text"
                  value={currentMeasurements.weight}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setProfile({
                      ...profile,
                      measurements: {
                        ...profile.measurements,
                        [profile.preferences.units]: {
                          ...currentMeasurements,
                          weight: newValue
                        },
                        [profile.preferences.units === 'imperial' ? 'metric' : 'imperial']: {
                          ...profile.measurements[profile.preferences.units === 'imperial' ? 'metric' : 'imperial'],
                          weight: convertWeight(newValue, profile.preferences.units === 'imperial' ? 'lbs' : 'kg')
                        }
                      }
                    });
                  }}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Height ({measurementUnits.height})
                </label>
                <input
                  type="text"
                  value={currentMeasurements.height}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setProfile({
                      ...profile,
                      measurements: {
                        ...profile.measurements,
                        [profile.preferences.units]: {
                          ...currentMeasurements,
                          height: newValue
                        },
                        [profile.preferences.units === 'imperial' ? 'metric' : 'imperial']: {
                          ...profile.measurements[profile.preferences.units === 'imperial' ? 'metric' : 'imperial'],
                          height: convertHeight(newValue, profile.preferences.units === 'imperial' ? 'ft' : 'cm')
                        }
                      }
                    });
                  }}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Body Fat %
                </label>
                <input
                  type="text"
                  value={currentMeasurements.bodyFat}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setProfile({
                      ...profile,
                      measurements: {
                        ...profile.measurements,
                        imperial: {
                          ...profile.measurements.imperial,
                          bodyFat: newValue
                        },
                        metric: {
                          ...profile.measurements.metric,
                          bodyFat: newValue
                        }
                      }
                    });
                  }}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">Goals</h2>
            <div className="space-y-4">
              {profile.goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-4">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => {
                      const newGoals = [...profile.goals];
                      newGoals[index] = e.target.value;
                      setProfile({ ...profile, goals: newGoals });
                    }}
                    disabled={!isEditing}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newGoals = profile.goals.filter((_, i) => i !== index);
                        setProfile({ ...profile, goals: newGoals });
                      }}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => {
                    setProfile({
                      ...profile,
                      goals: [...profile.goals, ""],
                    });
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  + Add Goal
                </button>
              )}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">Dietary Restrictions</h2>
            <div className="space-y-4">
              {profile.dietaryRestrictions.map((restriction, index) => (
                <div key={index} className="flex items-center gap-4">
                  <input
                    type="text"
                    value={restriction}
                    onChange={(e) => {
                      const newRestrictions = [...profile.dietaryRestrictions];
                      newRestrictions[index] = e.target.value;
                      setProfile({ ...profile, dietaryRestrictions: newRestrictions });
                    }}
                    disabled={!isEditing}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newRestrictions = profile.dietaryRestrictions.filter(
                          (_, i) => i !== index
                        );
                        setProfile({ ...profile, dietaryRestrictions: newRestrictions });
                      }}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => {
                    setProfile({
                      ...profile,
                      dietaryRestrictions: [...profile.dietaryRestrictions, ""],
                    });
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  + Add Restriction
                </button>
              )}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={profile.preferences.notifications.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: {
                          ...profile.preferences.notifications,
                          email: e.target.checked,
                        },
                      },
                    })
                  }
                  disabled={!isEditing}
                  className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-600 disabled:opacity-50"
                />
                <label htmlFor="emailNotifications" className="text-white">
                  Email Notifications
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  checked={profile.preferences.notifications.push}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: {
                          ...profile.preferences.notifications,
                          push: e.target.checked,
                        },
                      },
                    })
                  }
                  disabled={!isEditing}
                  className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-600 disabled:opacity-50"
                />
                <label htmlFor="pushNotifications" className="text-white">
                  Push Notifications
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={profile.preferences.notifications.sms}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: {
                          ...profile.preferences.notifications,
                          sms: e.target.checked,
                        },
                      },
                    })
                  }
                  disabled={!isEditing}
                  className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-600 disabled:opacity-50"
                />
                <label htmlFor="smsNotifications" className="text-white">
                  SMS Notifications
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 