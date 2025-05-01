import { db } from '@/lib/firebase/firestore';
import { getOrganization } from './organizations';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';

export interface UsageMetrics {
  totalClients: number;
  totalCheckIns: number;
  totalPhotos: number;
  storageUsed: number; // in bytes
  lastUpdated: Date;
}

export async function getOrganizationUsage(organizationId: string): Promise<UsageMetrics> {
  const usageRef = db.collection('organizations').doc(organizationId).collection('usage').doc('metrics');
  const usageDoc = await usageRef.get();
  
  if (!usageDoc.exists) {
    const initialUsage: UsageMetrics = {
      totalClients: 0,
      totalCheckIns: 0,
      totalPhotos: 0,
      storageUsed: 0,
      lastUpdated: new Date(),
    };
    await usageRef.set(initialUsage);
    return initialUsage;
  }
  
  return usageDoc.data() as UsageMetrics;
}

export async function updateUsageMetrics(organizationId: string, metrics: Partial<UsageMetrics>) {
  const usageRef = db.collection('organizations').doc(organizationId).collection('usage').doc('metrics');
  await usageRef.update({
    ...metrics,
    lastUpdated: new Date(),
  });
}

export async function checkUsageLimits(organizationId: string): Promise<{
  canAddClients: boolean;
  canAddCheckIns: boolean;
  canUploadPhotos: boolean;
  canUseStorage: boolean;
  currentUsage: UsageMetrics;
}> {
  const [organization, usage] = await Promise.all([
    getOrganization(organizationId),
    getOrganizationUsage(organizationId),
  ]);

  const plan = SUBSCRIPTION_PLANS[organization.plan || 'FREE'];
  
  return {
    canAddClients: usage.totalClients < plan.maxClients,
    canAddCheckIns: usage.totalCheckIns < plan.maxCheckInsPerMonth,
    canUploadPhotos: usage.totalPhotos < plan.maxPhotosPerClient,
    canUseStorage: usage.storageUsed < plan.maxStorageGB * 1024 * 1024 * 1024, // Convert GB to bytes
    currentUsage: usage,
  };
}

export async function incrementUsageMetric(
  organizationId: string,
  metric: keyof UsageMetrics,
  amount: number = 1
) {
  const usageRef = db.collection('organizations').doc(organizationId).collection('usage').doc('metrics');
  await usageRef.update({
    [metric]: db.FieldValue.increment(amount),
    lastUpdated: new Date(),
  });
}

// Reset monthly metrics on the first day of each month
export async function resetMonthlyMetrics(organizationId: string) {
  const usageRef = db.collection('organizations').doc(organizationId).collection('usage').doc('metrics');
  await usageRef.update({
    totalCheckIns: 0,
    lastUpdated: new Date(),
  });
} 