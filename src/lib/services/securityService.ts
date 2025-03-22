import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, updatePassword, updateProfile } from 'firebase/auth';

const SECURITY_SETTINGS_COLLECTION = 'securitySettings';

export interface SecuritySettings {
  authentication: {
    passwordRequirements: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number; // in minutes
    maxLoginAttempts: number;
  };
  twoFactor: {
    required: boolean;
    method: 'authenticator' | 'sms' | 'email';
    expiry: number; // in hours
  };
  dataEncryption: {
    messageEncryption: boolean;
    fileEncryption: boolean;
    keyRotation: boolean;
  };
  dataRetention: {
    messageRetention: number; // in days
    fileRetention: number; // in days
  };
  accessControl: {
    ipWhitelisting: {
      enabled: boolean;
      allowedIPs: string[];
    };
    rolePermissions: {
      admin: {
        fullAccess: boolean;
        userManagement: boolean;
        securitySettings: boolean;
      };
      coach: {
        clientManagement: boolean;
        sessionScheduling: boolean;
        resourceAccess: boolean;
      };
      client: {
        profileManagement: boolean;
        sessionBooking: boolean;
        resourceViewing: boolean;
      };
    };
  };
  auditLogging: {
    enabled: boolean;
    logAuthentication: boolean;
    logDataAccess: boolean;
    logConfigChanges: boolean;
    retention: number; // in days
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export const getSecuritySettings = async (adminId: string): Promise<SecuritySettings | null> => {
  try {
    const docRef = doc(db, SECURITY_SETTINGS_COLLECTION, adminId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SecuritySettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting security settings:', error);
    throw error;
  }
};

export const saveSecuritySettings = async (adminId: string, settings: Partial<SecuritySettings>): Promise<void> => {
  try {
    const docRef = doc(db, SECURITY_SETTINGS_COLLECTION, adminId);
    const docSnap = await getDoc(docRef);
    
    const settingsData = {
      ...settings,
      updatedAt: serverTimestamp(),
    };

    if (docSnap.exists()) {
      await updateDoc(docRef, settingsData);
    } else {
      await setDoc(docRef, {
        ...settingsData,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error saving security settings:', error);
    throw error;
  }
};

export const validatePassword = (password: string, requirements: SecuritySettings['authentication']['passwordRequirements']): boolean => {
  if (password.length < requirements.minLength) return false;
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requirements.requireNumbers && !/[0-9]/.test(password)) return false;
  if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
};

export const updateUserPassword = async (newPassword: string): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No authenticated user found');
  }

  try {
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const validateIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) return false;
  
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  return true;
};

export const getDefaultSecuritySettings = (): SecuritySettings => ({
  authentication: {
    passwordRequirements: {
      minLength: 12,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    sessionTimeout: 60,
    maxLoginAttempts: 5,
  },
  twoFactor: {
    required: true,
    method: 'authenticator',
    expiry: 24,
  },
  dataEncryption: {
    messageEncryption: true,
    fileEncryption: true,
    keyRotation: true,
  },
  dataRetention: {
    messageRetention: 90,
    fileRetention: 90,
  },
  accessControl: {
    ipWhitelisting: {
      enabled: false,
      allowedIPs: [],
    },
    rolePermissions: {
      admin: {
        fullAccess: true,
        userManagement: true,
        securitySettings: true,
      },
      coach: {
        clientManagement: true,
        sessionScheduling: true,
        resourceAccess: true,
      },
      client: {
        profileManagement: true,
        sessionBooking: true,
        resourceViewing: true,
      },
    },
  },
  auditLogging: {
    enabled: true,
    logAuthentication: true,
    logDataAccess: true,
    logConfigChanges: true,
    retention: 90,
  },
}); 