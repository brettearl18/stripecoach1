import { NotificationSettings } from './notifications';

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: {
    clientManagement: boolean;
    resourceCreation: boolean;
    analyticsAccess: boolean;
    teamManagement: boolean;
    billingAccess: boolean;
    settingsAccess: boolean;
    reportGeneration: boolean;
    userManagement: boolean;
  };
  settings: {
    maxClients: number;
    featureAccess: string[];
    notificationPreferences: NotificationSettings;
    dataAccess: {
      canViewAllClients: boolean;
      canViewAllCoaches: boolean;
      canViewAnalytics: boolean;
      canViewBilling: boolean;
    };
  };
  defaultRole: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleHierarchy {
  id: string;
  name: string;
  level: number;
  parentRole?: string;
  inheritedPermissions: string[];
  customPermissions: string[];
  canManageRoles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  templateId?: string;
  hierarchyId?: string;
  permissions: RoleTemplate['permissions'];
  settings: RoleTemplate['settings'];
  createdAt: Date;
  updatedAt: Date;
} 