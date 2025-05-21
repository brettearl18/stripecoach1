import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, updatePassword, updateProfile } from 'firebase/auth';
import { validatePassword } from '../firebase/auth-rules';

const SECURITY_SETTINGS_COLLECTION = 'securitySettings';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

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
    twoFactorAuth: {
      enabled: boolean;
      requiredForRoles: string[];
    };
  };
  auditLogging: {
    enabled: boolean;
    logAuthentication: boolean;
    logDataAccess: boolean;
    logConfigChanges: boolean;
    retention: number; // in days
  };
  fileUploadLimits: {
    maxFileSize: number; // in MB
    allowedTypes: string[];
  };
  sessionSettings: {
    timeout: number; // in minutes
    maxConcurrentSessions: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export class SecurityService {
  private static instance: SecurityService;
  private securitySettings: Map<string, SecuritySettings> = new Map();

  private constructor() {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Security Settings Management
  async getSecuritySettings(organizationId: string): Promise<SecuritySettings | null> {
    try {
      const cachedSettings = this.securitySettings.get(organizationId);
      if (cachedSettings) return cachedSettings;

      const settingsDoc = await getDoc(doc(db, SECURITY_SETTINGS_COLLECTION, organizationId));
      if (!settingsDoc.exists()) return null;

      const settings = settingsDoc.data() as SecuritySettings;
      this.securitySettings.set(organizationId, settings);
      return settings;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  }

  async updateSecuritySettings(organizationId: string, settings: Partial<SecuritySettings>): Promise<void> {
    try {
      const settingsRef = doc(db, SECURITY_SETTINGS_COLLECTION, organizationId);
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
      
      // Update cache
      const updatedSettings = await this.getSecuritySettings(organizationId);
      if (updatedSettings) {
        this.securitySettings.set(organizationId, updatedSettings);
      }

      // Log the change
      await this.logAuditEvent({
        userId: getAuth().currentUser?.uid || 'system',
        action: 'UPDATE_SECURITY_SETTINGS',
        resource: `organizations/${organizationId}/securitySettings`,
        details: settings,
        ipAddress: '', // To be implemented
        userAgent: '', // To be implemented
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  // Audit Logging
  async logAuditEvent(log: AuditLog): Promise<void> {
    try {
      const settings = await this.getSecuritySettings(log.userId);
      if (!settings?.auditLogging.enabled) return;

      const auditRef = doc(collection(db, AUDIT_LOGS_COLLECTION));
      await setDoc(auditRef, {
        ...log,
        timestamp: serverTimestamp()
      });

      // Clean up old logs based on retention policy
      if (settings.auditLogging.retention) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - settings.auditLogging.retention);

        const oldLogsQuery = query(
          collection(db, AUDIT_LOGS_COLLECTION),
          where('timestamp', '<', cutoffDate)
        );
        const oldLogs = await getDocs(oldLogsQuery);
        
        // Delete old logs in batches
        const batch = db.batch();
        oldLogs.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw error to prevent disrupting the main flow
    }
  }

  // Access Control
  async checkAccess(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const settings = await this.getSecuritySettings(userId);
      if (!settings) return false;

      const userRole = await this.getUserRole(userId);
      if (!userRole) return false;

      const permissions = settings.accessControl.rolePermissions[userRole];
      if (!permissions) return false;

      // Check IP whitelisting if enabled
      if (settings.accessControl.ipWhitelisting.enabled) {
        const userIP = ''; // To be implemented
        if (!settings.accessControl.ipWhitelisting.allowedIPs.includes(userIP)) {
          return false;
        }
      }

      // Check role-specific permissions
      switch (action) {
        case 'manageUsers':
          return permissions.admin?.userManagement || false;
        case 'manageSecurity':
          return permissions.admin?.securitySettings || false;
        case 'manageClients':
          return permissions.coach?.clientManagement || false;
        case 'scheduleSessions':
          return permissions.coach?.sessionScheduling || false;
        case 'accessResources':
          return permissions.coach?.resourceAccess || false;
        case 'manageProfile':
          return permissions.client?.profileManagement || false;
        case 'bookSessions':
          return permissions.client?.sessionBooking || false;
        case 'viewResources':
          return permissions.client?.resourceViewing || false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  }

  // User Role Management
  private async getUserRole(userId: string): Promise<'admin' | 'coach' | 'client' | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;
      return userDoc.data().role;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  // Password Management
  async validateAndUpdatePassword(userId: string, newPassword: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const settings = await this.getSecuritySettings(userId);
      if (!settings) {
        throw new Error('Security settings not found');
      }

      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      await updatePassword(user, newPassword);

      // Log password change
      await this.logAuditEvent({
        userId,
        action: 'PASSWORD_CHANGE',
        resource: `users/${userId}`,
        details: { timestamp: new Date() },
        ipAddress: '', // To be implemented
        userAgent: '', // To be implemented
        timestamp: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}

export const getDefaultSecuritySettings = (): SecuritySettings => ({
  accessControl: {
    ipWhitelisting: {
      enabled: false,
      allowedIPs: []
    },
    twoFactorAuth: {
      enabled: false,
      requiredForRoles: ['admin']
    }
  },
  fileUploadLimits: {
    maxFileSize: 10, // 10MB
    allowedTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
  },
  sessionSettings: {
    timeout: 30, // 30 minutes
    maxConcurrentSessions: 1
  }
});

export const getSecuritySettings = async (userId: string): Promise<SecuritySettings> => {
  try {
    const docRef = doc(db, 'securitySettings', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SecuritySettings;
    }

    // If no settings exist, create default ones
    const defaultSettings = getDefaultSecuritySettings();
    await saveSecuritySettings(userId, defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Error getting security settings:', error);
    return getDefaultSecuritySettings();
  }
};

export const saveSecuritySettings = async (
  userId: string,
  settings: SecuritySettings
): Promise<void> => {
  try {
    const docRef = doc(db, 'securitySettings', userId);
    await setDoc(docRef, settings);
  } catch (error) {
    console.error('Error saving security settings:', error);
    throw error;
  }
};