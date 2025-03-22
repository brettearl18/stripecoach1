import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { SecuritySettings, getSecuritySettings, saveSecuritySettings, getDefaultSecuritySettings } from '@/lib/services/securityService';
import toast from 'react-hot-toast';

export const useSecuritySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const loadedSettings = await getSecuritySettings(user.uid);
        setSettings(loadedSettings || getDefaultSecuritySettings());
      } catch (error) {
        console.error('Error loading security settings:', error);
        toast.error('Failed to load security settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.uid]);

  const updateSettings = async (newSettings: Partial<SecuritySettings>) => {
    if (!user?.uid || !settings) return;

    try {
      setSaving(true);
      const updatedSettings = {
        ...settings,
        ...newSettings,
      };
      await saveSecuritySettings(user.uid, updatedSettings);
      setSettings(updatedSettings);
      toast.success('Security settings updated successfully');
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!user?.uid) return;

    try {
      setSaving(true);
      const defaultSettings = getDefaultSecuritySettings();
      await saveSecuritySettings(user.uid, defaultSettings);
      setSettings(defaultSettings);
      toast.success('Security settings reset to default');
    } catch (error) {
      console.error('Error resetting security settings:', error);
      toast.error('Failed to reset security settings');
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
    resetToDefault,
  };
}; 