import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

interface TenantConfig {
  name: string;
  domain?: string;
  maxClients?: number;
  maxCoaches?: number;
  features?: {
    audioMessages?: boolean;
    videoMessages?: boolean;
    fileSharing?: boolean;
    analytics?: boolean;
  };
  customization?: {
    theme?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    logo?: string;
  };
  billing?: {
    plan: 'starter' | 'professional' | 'enterprise';
    subscriptionId?: string;
    trialEnds?: Date;
  };
}

interface TenantStats {
  activeClients: number;
  activeCoaches: number;
  messagesSent: number;
  storageUsed: number;
  lastActivity: Date;
}

export class TenantManager {
  private redis: Redis;
  private readonly TENANT_PREFIX = 'tenant:';
  private readonly TENANT_STATS_PREFIX = 'tenant_stats:';
  private readonly DOMAIN_INDEX = 'domain_index';

  constructor(redisConfig: { host: string; port: number; password?: string }) {
    this.redis = new Redis(redisConfig);
  }

  async createTenant(config: TenantConfig): Promise<string> {
    const tenantId = uuidv4();
    
    // Validate domain uniqueness if provided
    if (config.domain) {
      const existingTenant = await this.redis.hget(this.DOMAIN_INDEX, config.domain);
      if (existingTenant) {
        throw new Error('Domain already in use');
      }
    }

    // Initialize tenant configuration
    const tenant = {
      id: tenantId,
      ...config,
      created: new Date(),
      status: 'active',
      features: {
        audioMessages: true,
        videoMessages: false,
        fileSharing: true,
        analytics: false,
        ...config.features,
      },
    };

    // Store tenant configuration
    await this.redis.set(
      `${this.TENANT_PREFIX}${tenantId}`,
      JSON.stringify(tenant)
    );

    // Initialize tenant statistics
    const stats: TenantStats = {
      activeClients: 0,
      activeCoaches: 0,
      messagesSent: 0,
      storageUsed: 0,
      lastActivity: new Date(),
    };

    await this.redis.set(
      `${this.TENANT_STATS_PREFIX}${tenantId}`,
      JSON.stringify(stats)
    );

    // Index domain if provided
    if (config.domain) {
      await this.redis.hset(this.DOMAIN_INDEX, config.domain, tenantId);
    }

    return tenantId;
  }

  async getTenant(tenantId: string) {
    const tenant = await this.redis.get(`${this.TENANT_PREFIX}${tenantId}`);
    return tenant ? JSON.parse(tenant) : null;
  }

  async getTenantByDomain(domain: string) {
    const tenantId = await this.redis.hget(this.DOMAIN_INDEX, domain);
    if (!tenantId) return null;
    return this.getTenant(tenantId);
  }

  async updateTenant(tenantId: string, updates: Partial<TenantConfig>) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    // Handle domain update
    if (updates.domain && updates.domain !== tenant.domain) {
      const existingTenant = await this.redis.hget(this.DOMAIN_INDEX, updates.domain);
      if (existingTenant) throw new Error('Domain already in use');

      // Update domain index
      if (tenant.domain) {
        await this.redis.hdel(this.DOMAIN_INDEX, tenant.domain);
      }
      await this.redis.hset(this.DOMAIN_INDEX, updates.domain, tenantId);
    }

    // Update tenant configuration
    const updatedTenant = {
      ...tenant,
      ...updates,
      updated: new Date(),
    };

    await this.redis.set(
      `${this.TENANT_PREFIX}${tenantId}`,
      JSON.stringify(updatedTenant)
    );

    return updatedTenant;
  }

  async updateTenantStats(tenantId: string, updates: Partial<TenantStats>) {
    const statsKey = `${this.TENANT_STATS_PREFIX}${tenantId}`;
    const currentStats = await this.redis.get(statsKey);
    
    if (!currentStats) throw new Error('Tenant stats not found');

    const updatedStats = {
      ...JSON.parse(currentStats),
      ...updates,
      lastActivity: new Date(),
    };

    await this.redis.set(statsKey, JSON.stringify(updatedStats));
    return updatedStats;
  }

  async getTenantStats(tenantId: string) {
    const stats = await this.redis.get(`${this.TENANT_STATS_PREFIX}${tenantId}`);
    return stats ? JSON.parse(stats) : null;
  }

  async deleteTenant(tenantId: string) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    // Remove domain index if exists
    if (tenant.domain) {
      await this.redis.hdel(this.DOMAIN_INDEX, tenant.domain);
    }

    // Remove tenant configuration and stats
    await Promise.all([
      this.redis.del(`${this.TENANT_PREFIX}${tenantId}`),
      this.redis.del(`${this.TENANT_STATS_PREFIX}${tenantId}`),
    ]);

    return true;
  }

  async listTenants(options: {
    offset?: number;
    limit?: number;
    status?: 'active' | 'suspended' | 'trial';
  } = {}) {
    const { offset = 0, limit = 10 } = options;
    
    // Get tenant IDs using scan for pagination
    const tenantKeys = await this.scanTenantKeys(offset, limit, options.status);
    
    // Fetch tenant details in parallel
    const tenants = await Promise.all(
      tenantKeys.map(async (key) => {
        const tenant = await this.redis.get(key);
        return tenant ? JSON.parse(tenant) : null;
      })
    );

    return tenants.filter(Boolean);
  }

  private async scanTenantKeys(offset: number, limit: number, status?: string) {
    const keys: string[] = [];
    let cursor = '0';
    
    do {
      const [newCursor, batch] = await this.redis.scan(
        cursor,
        'MATCH',
        `${this.TENANT_PREFIX}*`,
        'COUNT',
        100
      );
      
      cursor = newCursor;
      keys.push(...batch);
    } while (cursor !== '0' && keys.length < offset + limit);

    return keys.slice(offset, offset + limit);
  }

  async cleanup() {
    await this.redis.quit();
  }
} 