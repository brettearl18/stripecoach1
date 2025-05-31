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
  },

  // Get dashboard metrics for a coach
  async getCoachDashboardMetrics(coachId: string): Promise<CoachDashboardMetrics> {
    // Fetch all clients for this coach
    const clientsRef = collection(db, COLLECTIONS.CLIENTS);
    const clientsQuery = query(clientsRef, where('coachId', '==', coachId));
    const clientsSnap = await getDocs(clientsQuery);
    const clients = clientsSnap.docs.map(doc => doc.data());

    // Fetch all check-ins for these clients
    const clientIds = clients.map((c: any) => c.id);
    let checkIns: any[] = [];
    if (clientIds.length > 0) {
      const checkInsRef = collection(db, COLLECTIONS.CHECK_INS);
      const checkInsQuery = query(checkInsRef, where('clientId', 'in', clientIds));
      const checkInsSnap = await getDocs(checkInsQuery);
      checkIns = checkInsSnap.docs.map(doc => doc.data());
    }

    // Calculate metrics
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const totalClients = clients.length;
    const activeToday = clients.filter((client: any) => {
      // Assume lastCheckIn is ISO string
      return client.lastCheckIn && client.lastCheckIn.slice(0, 10) === todayStr;
    }).length;
    const pendingCheckIns = checkIns.filter(ci => ci.status === 'pending').length;
    const completedCheckIns = checkIns.filter(ci => ci.status === 'completed').length;

    // Progress buckets (example logic, adjust as needed)
    let improving = 0, steady = 0, needsAttention = 0;
    clients.forEach((client: any) => {
      const progress = client.metrics?.progress || 0;
      if (progress >= 75) improving++;
      else if (progress >= 40) steady++;
      else needsAttention++;
    });

    // Weekly engagement: % of clients with at least 1 check-in in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    const activeClientIds = new Set(
      checkIns.filter(ci => new Date(ci.completedAt) >= weekAgo).map(ci => ci.clientId)
    );
    const weeklyEngagement = totalClients > 0 ? Math.round((activeClientIds.size / totalClients) * 100) : 0;

    return {
      totalClients,
      activeToday,
      pendingCheckIns,
      completedCheckIns,
      clientProgress: {
        improving,
        steady,
        needsAttention,
      },
      weeklyEngagement,
    };
  },

  // Get client progress cards data for a coach
  async getCoachClientsProgress(coachId: string): Promise<Array<{
    id: string;
    name: string;
    avatar?: string;
    lastCheckIn: string;
    checkInStreak: number;
    weeklyProgress: {
      training: number;
      nutrition: number;
      mindset: number;
    };
    recentAchievements: string[];
    focusAreas: string[];
    status: 'on_track' | 'needs_attention' | 'at_risk';
  }>> {
    // Fetch all clients for this coach
    const clientsRef = collection(db, COLLECTIONS.CLIENTS);
    const clientsQuery = query(clientsRef, where('coachId', '==', coachId));
    const clientsSnap = await getDocs(clientsQuery);
    const clients = clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // For each client, fetch their latest check-in
    const results = await Promise.all(clients.map(async (client: any) => {
      const checkInsRef = collection(db, COLLECTIONS.CHECK_INS);
      const checkInsQuery = query(
        checkInsRef,
        where('clientId', '==', client.id),
        orderBy('completedAt', 'desc'),
        limit(1)
      );
      const checkInsSnap = await getDocs(checkInsQuery);
      const latestCheckIn = checkInsSnap.docs[0]?.data();

      // Map to card fields
      return {
        id: client.id,
        name: client.name || '',
        avatar: client.avatar || '',
        lastCheckIn: latestCheckIn?.completedAt || '',
        checkInStreak: latestCheckIn?.streak?.current || 0,
        weeklyProgress: {
          training: latestCheckIn?.metrics?.training ?? 0,
          nutrition: latestCheckIn?.metrics?.nutrition ?? 0,
          mindset: latestCheckIn?.metrics?.mindset ?? 0,
        },
        recentAchievements: latestCheckIn?.progress?.achievements?.map((a: any) => a.description) || [],
        focusAreas: latestCheckIn?.progress?.goals?.filter((g: any) => g.status !== 'completed').map((g: any) => g.name) || [],
        status: latestCheckIn?.status?.clientProgress || 'on_track',
      };
    }));
    return results;
  },

  // Get all recent check-ins for a coach's clients (last 14 days)
  async getRecentCheckInsForCoach(coachId: string, days: number = 14): Promise<CheckInForm[]> {
    // Fetch all clients for this coach
    const clientsRef = collection(db, COLLECTIONS.CLIENTS);
    const clientsQuery = query(clientsRef, where('coachId', '==', coachId));
    const clientsSnap = await getDocs(clientsQuery);
    const clientIds = clientsSnap.docs.map(doc => doc.id);

    if (clientIds.length === 0) return [];

    // Calculate date range
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Fetch all check-ins for these clients in the date range
    const checkInsRef = collection(db, COLLECTIONS.CHECK_INS);
    const checkInsQuery = query(
      checkInsRef,
      where('clientId', 'in', clientIds),
      where('completedAt', '>=', since)
    );
    const checkInsSnap = await getDocs(checkInsQuery);
    const checkIns = checkInsSnap.docs.map(doc => doc.data() as CheckInForm);
    // Sort by completedAt descending
    checkIns.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return checkIns;
  },

  // Get analytics for active (not archived) programs for a coach
  async getActiveProgramAnalyticsForCoach(coachId: string) {
    // Fetch all active program templates for this coach
    const templatesRef = collection(db, 'programTemplates');
    const templatesQuery = query(templatesRef, where('coachId', '==', coachId), where('archived', '==', false));
    const templatesSnap = await getDocs(templatesQuery);
    const templates = templatesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch all active program assignments (not completed/archived)
    const assignmentsRef = collection(db, 'programAssignments');
    const assignmentsQuery = query(assignmentsRef, where('coachId', '==', coachId), where('archived', '==', false), where('completed', '==', false));
    const assignmentsSnap = await getDocs(assignmentsQuery);
    const assignments = assignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch all check-ins for these assignments
    const assignmentIds = assignments.map(a => a.id);
    let checkIns = [];
    if (assignmentIds.length > 0) {
      const checkInsRef = collection(db, 'checkIns');
      const checkInsQuery = query(checkInsRef, where('assignmentId', 'in', assignmentIds));
      const checkInsSnap = await getDocs(checkInsQuery);
      checkIns = checkInsSnap.docs.map(doc => doc.data());
    }

    // Aggregate data
    // 1. Enrollments over time (by week)
    const enrollmentsOverTime = {};
    assignments.forEach(a => {
      const week = new Date(a.startDate).toISOString().slice(0, 10); // YYYY-MM-DD
      const programName = templates.find(t => t.id === a.programTemplateId)?.name || 'Unknown';
      const key = `${programName}|${week}`;
      enrollmentsOverTime[key] = (enrollmentsOverTime[key] || 0) + 1;
    });
    const enrollmentsOverTimeArr = Object.entries(enrollmentsOverTime).map(([key, count]) => {
      const [programName, week] = key.split('|');
      return { programName, week, count };
    });

    // 2. Completion rates (for active programs, so will be < 100%)
    const completionRates = templates.map(t => {
      const total = assignments.filter(a => a.programTemplateId === t.id).length;
      const completed = assignments.filter(a => a.programTemplateId === t.id && a.completed).length;
      return {
        programName: t.name,
        completionRate: total > 0 ? completed / total : 0
      };
    });

    // 3. Drop-off points (most common week of drop-out)
    const dropOffPoints = templates.map(t => {
      const drops = assignments.filter(a => a.programTemplateId === t.id && a.droppedOutWeek != null).map(a => a.droppedOutWeek);
      if (!drops.length) return { programName: t.name, week: null, dropOffCount: 0 };
      const weekCounts = drops.reduce((acc, week) => { acc[week] = (acc[week] || 0) + 1; return acc; }, {});
      const maxWeek = Object.entries(weekCounts).sort((a, b) => b[1] - a[1])[0];
      return { programName: t.name, week: maxWeek[0], dropOffCount: maxWeek[1] };
    });

    // 4. Progress distribution
    const progressDistribution = templates.map(t => {
      const started = assignments.filter(a => a.programTemplateId === t.id).length;
      const halfway = assignments.filter(a => a.programTemplateId === t.id && a.progress >= 50 && a.progress < 100).length;
      const completed = assignments.filter(a => a.programTemplateId === t.id && a.completed).length;
      const dropped = assignments.filter(a => a.programTemplateId === t.id && a.droppedOut).length;
      return {
        programName: t.name,
        started,
        halfway,
        completed,
        dropped
      };
    });

    // 5. Average results (example: avgWeightLost, avgStrengthGained)
    const averageResults = templates.map(t => {
      const relevantAssignments = assignments.filter(a => a.programTemplateId === t.id);
      const avgWeightLost = relevantAssignments.reduce((acc, a) => acc + (a.weightLost || 0), 0) / (relevantAssignments.length || 1);
      const avgStrengthGained = relevantAssignments.reduce((acc, a) => acc + (a.strengthGained || 0), 0) / (relevantAssignments.length || 1);
      return {
        programName: t.name,
        avgWeightLost,
        avgStrengthGained
      };
    });

    return {
      enrollmentsOverTime: enrollmentsOverTimeArr,
      completionRates,
      dropOffPoints,
      progressDistribution,
      averageResults
    };
  },

  // Get all program assignments (active, completed, archived) for a client
  async getAllProgramAssignmentsForClient(clientId: string) {
    const assignmentsRef = collection(db, 'programAssignments');
    const assignmentsQuery = query(assignmentsRef, where('clientId', '==', clientId));
    const assignmentsSnap = await getDocs(assignmentsQuery);
    const assignments = assignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort by start date descending
    assignments.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    return assignments;
  },
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