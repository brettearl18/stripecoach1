export interface APICredentials {
  id: string;
  coachId: string;
  name: string;
  apiKey: string;
  secretKey: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  webhookUrl?: string;
  createdAt: Date;
  lastUsed: Date;
  status: 'active' | 'suspended' | 'revoked';
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    admin: boolean;
  };
  allowedIPs?: string[];
  description?: string;
}

export interface APIUsage {
  id: string;
  coachId: string;
  apiKeyId: string;
  timestamp: Date;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  ipAddress: string;
}

export interface APIRateLimit {
  id: string;
  coachId: string;
  apiKeyId: string;
  currentUsage: {
    minute: number;
    hour: number;
    day: number;
  };
  lastReset: {
    minute: Date;
    hour: Date;
    day: Date;
  };
} 