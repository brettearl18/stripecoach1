import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export interface CompanyAnalytics {
  activeCoaches: number;
  activeClients: number;
  storageUsed: number;
  lastActivity: Date;
  clientRetentionRate: number;
  averageSessionsPerWeek: number;
  revenueLastMonth: number;
  usageStats: {
    apiCalls: number;
    storageUsed: number;
    activeUsers: number;
  };
}

export async function getCompanyAnalytics(companyId: string): Promise<CompanyAnalytics> {
  try {
    // Get coaches count
    const coachesRef = collection(db, 'coaches');
    const coachesQuery = query(coachesRef, where('companyId', '==', companyId));
    const coachesSnap = await getDocs(coachesQuery);
    const activeCoaches = coachesSnap.docs.length;

    // Get clients count
    const clientsRef = collection(db, 'clients');
    const clientsQuery = query(clientsRef, where('companyId', '==', companyId));
    const clientsSnap = await getDocs(clientsQuery);
    const activeClients = clientsSnap.docs.length;

    // Get analytics document if it exists
    const analyticsRef = doc(db, 'analytics', companyId);
    const analyticsSnap = await getDoc(analyticsRef);
    const analyticsData = analyticsSnap.exists() ? analyticsSnap.data() : null;

    return {
      activeCoaches,
      activeClients,
      storageUsed: analyticsData?.storageUsed || 0,
      lastActivity: analyticsData?.lastActivity ? new Date(analyticsData.lastActivity) : new Date(),
      clientRetentionRate: analyticsData?.clientRetentionRate || 100,
      averageSessionsPerWeek: analyticsData?.averageSessionsPerWeek || 0,
      revenueLastMonth: analyticsData?.revenueLastMonth || 0,
      usageStats: {
        apiCalls: analyticsData?.usageStats?.apiCalls || 0,
        storageUsed: analyticsData?.usageStats?.storageUsed || 0,
        activeUsers: analyticsData?.usageStats?.activeUsers || 0
      }
    };
  } catch (error) {
    console.error('Error fetching company analytics:', error);
    throw error;
  }
} 