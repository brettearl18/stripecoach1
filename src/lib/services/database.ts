import { db, realtimeDb } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { ref, get, set, update, push } from 'firebase/database';
import { CheckInForm, ClientProfile, CoachDashboardMetrics } from '@/types';

// Firestore Collections
const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients',
  COACHES: 'coaches',
  CHECK_INS: 'checkIns',
  ANALYTICS: 'analytics',
  ORGANIZATIONS: 'organizations',
  REPORTS: 'reports'
} as const;

// Realtime Database References
const REALTIME_PATHS = {
  ACTIVE_CLIENTS: 'activeClients',
  COACH_METRICS: 'coachMetrics',
  CLIENT_METRICS: 'clientMetrics',
  ANALYTICS: 'analytics'
} as const;

// Analytics Data Operations
export const analyticsService = {
  // Get category comparison data
  async getCategoryComparison(coachId: string, dateRange: { start: Date; end: Date }) {
    const checkInsRef = collection(db, COLLECTIONS.CHECK_INS);
    const q = query(
      checkInsRef,
      where('coachId', '==', coachId),
      where('completedAt', '>=', dateRange.start),
      where('completedAt', '<=', dateRange.end)
    );

    const snapshot = await getDocs(q);
    const checkIns = snapshot.docs.map(doc => doc.data() as CheckInForm);

    // Calculate category averages
    const categoryTotals = checkIns.reduce((acc, checkIn) => {
      Object.entries(checkIn.metrics).forEach(([category, data]) => {
        acc[category] = (acc[category] || 0) + data.score;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, total]) => ({
      name,
      value: Math.round(total / checkIns.length)
    }));
  },

  // Get sentiment highlights
  async getSentimentHighlights(coachId: string) {
    const checkInsRef = collection(db, COLLECTIONS.CHECK_INS);
    const q = query(
      checkInsRef,
      where('coachId', '==', coachId),
      orderBy('completedAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const checkIns = snapshot.docs.map(doc => doc.data() as CheckInForm);

    // Process sentiment data
    const winning = checkIns
      .filter(ci => ci.aiInsights?.trends.some(t => t.trend === 'up'))
      .map(ci => ({
        text: ci.aiInsights?.summary || '',
        client: ci.clientId,
        week: Math.ceil((new Date().getTime() - new Date(ci.completedAt!).getTime()) / (7 * 24 * 60 * 60 * 1000))
      }));

    const cautious = checkIns
      .filter(ci => ci.aiInsights?.trends.some(t => t.trend === 'down'))
      .map(ci => ({
        text: ci.aiInsights?.summary || '',
        client: ci.clientId,
        week: Math.ceil((new Date().getTime() - new Date(ci.completedAt!).getTime()) / (7 * 24 * 60 * 60 * 1000))
      }));

    return { winning, cautious };
  },

  // Update realtime analytics
  async updateRealtimeAnalytics(coachId: string, metrics: Partial<CoachDashboardMetrics>) {
    const analyticsRef = ref(realtimeDb, `${REALTIME_PATHS.ANALYTICS}/${coachId}`);
    await update(analyticsRef, metrics);
  }
};

// Client Data Operations
export const clientService = {
  async getClientProfile(clientId: string) {
    const docRef = doc(db, COLLECTIONS.CLIENTS, clientId);
    const snapshot = await getDoc(docRef);
    return snapshot.data() as ClientProfile;
  },

  async updateClientMetrics(clientId: string, metrics: Partial<ClientProfile['metrics']>) {
    const docRef = doc(db, COLLECTIONS.CLIENTS, clientId);
    await updateDoc(docRef, { metrics });
  }
};

// Check-in Operations
export const checkInService = {
  async getClientCheckIns(clientId: string, limit = 10) {
    const checkInsRef = collection(db, COLLECTIONS.CHECK_INS);
    const q = query(
      checkInsRef,
      where('clientId', '==', clientId),
      orderBy('completedAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as CheckInForm);
  },

  async submitCheckIn(checkIn: Omit<CheckInForm, 'id'>) {
    const checkInsRef = collection(db, COLLECTIONS.CHECK_INS);
    const docRef = doc(checkInsRef);
    await setDoc(docRef, { ...checkIn, id: docRef.id });
    return docRef.id;
  }
}; 