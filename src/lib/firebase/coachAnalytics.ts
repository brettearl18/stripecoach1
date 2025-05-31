import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore';

// 1. Get active clients for a coach
export async function getActiveClients(coachId: string) {
  const q = query(collection(db, 'clients'), where('coachId', '==', coachId), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 2. Get check-ins for a coach's clients in the last 7 days
export async function getRecentCheckIns(coachId: string) {
  const clients = await getActiveClients(coachId);
  const clientIds = clients.map(c => c.id);
  if (clientIds.length === 0) return [];
  const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  // Firestore 'in' queries are limited to 10 elements; batch if needed
  const batches = [];
  for (let i = 0; i < clientIds.length; i += 10) {
    const batchIds = clientIds.slice(i, i + 10);
    const q = query(collection(db, 'checkins'), where('clientId', 'in', batchIds), where('date', '>=', sevenDaysAgo));
    batches.push(getDocs(q));
  }
  const snapshots = await Promise.all(batches);
  return snapshots.flatMap(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
}

// 3. Get average program progress for a coach's clients
export async function getAverageClientProgress(coachId: string) {
  const clients = await getActiveClients(coachId);
  const clientIds = clients.map(c => c.id);
  if (clientIds.length === 0) return 0;
  const batches = [];
  for (let i = 0; i < clientIds.length; i += 10) {
    const batchIds = clientIds.slice(i, i + 10);
    const q = query(collection(db, 'programs'), where('clientId', 'in', batchIds));
    batches.push(getDocs(q));
  }
  const snapshots = await Promise.all(batches);
  const progresses = snapshots.flatMap(snapshot => snapshot.docs.map(doc => doc.data().progress || 0));
  const avg = progresses.length ? progresses.reduce((a, b) => a + b, 0) / progresses.length : 0;
  return Math.round(avg);
}

// 4. Get priority alerts for a coach's clients
export async function getPriorityAlerts(coachId: string) {
  const clients = await getActiveClients(coachId);
  const clientIds = clients.map(c => c.id);
  if (clientIds.length === 0) return [];
  const batches = [];
  for (let i = 0; i < clientIds.length; i += 10) {
    const batchIds = clientIds.slice(i, i + 10);
    const q = query(collection(db, 'alerts'), where('clientId', 'in', batchIds), where('resolved', '==', false));
    batches.push(getDocs(q));
  }
  const snapshots = await Promise.all(batches);
  return snapshots.flatMap(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
}

// 5. Get recent badge wins for a coach's clients
export async function getRecentBadgeWins(coachId: string) {
  const clients = await getActiveClients(coachId);
  const clientIds = clients.map(c => c.id);
  if (clientIds.length === 0) return [];
  const batches = [];
  for (let i = 0; i < clientIds.length; i += 10) {
    const batchIds = clientIds.slice(i, i + 10);
    const q = query(collection(db, 'badges'), where('clientId', 'in', batchIds));
    batches.push(getDocs(q));
  }
  const snapshots = await Promise.all(batches);
  return snapshots.flatMap(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
}

// 6. Get client of the week for a coach
export async function getClientOfTheWeek(coachId: string) {
  const clients = await getActiveClients(coachId);
  const clientIds = clients.map(c => c.id);
  if (clientIds.length === 0) return null;
  const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  // Fetch check-ins for each client in the last week
  const batches = [];
  for (let i = 0; i < clientIds.length; i += 10) {
    const batchIds = clientIds.slice(i, i + 10);
    const q = query(collection(db, 'checkins'), where('clientId', 'in', batchIds), where('date', '>=', sevenDaysAgo));
    batches.push(getDocs(q));
  }
  const snapshots = await Promise.all(batches);
  const checkIns = snapshots.flatMap(snapshot => snapshot.docs.map(doc => doc.data()));
  // Count check-ins per client
  const checkInCounts: Record<string, number> = {};
  checkIns.forEach(ci => {
    checkInCounts[ci.clientId] = (checkInCounts[ci.clientId] || 0) + 1;
  });
  // Find client with most check-ins
  let topClientId = null;
  let maxCheckIns = 0;
  for (const clientId of Object.keys(checkInCounts)) {
    if (checkInCounts[clientId] > maxCheckIns) {
      maxCheckIns = checkInCounts[clientId];
      topClientId = clientId;
    }
  }
  if (!topClientId) return null;
  // Return client data
  return clients.find(c => c.id === topClientId) || null;
}

// 7. Get paginated clients for a coach, with compliance % and last 5 check-ins
export async function getPaginatedClientsWithCompliance(coachId: string, pageSize = 25, lastDoc: any = null) {
  let q = query(
    collection(db, 'clients'),
    where('coachId', '==', coachId),
    orderBy('name'),
    limit(pageSize)
  );
  if (lastDoc) {
    q = query(
      collection(db, 'clients'),
      where('coachId', '==', coachId),
      orderBy('name'),
      startAfter(lastDoc),
      limit(pageSize)
    );
  }
  const snapshot = await getDocs(q);
  const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // For each client, fetch last 5 check-ins and calculate compliance %
  const clientData = await Promise.all(clients.map(async (client) => {
    const checkinQ = query(
      collection(db, 'checkins'),
      where('clientId', '==', client.id),
      orderBy('date', 'desc'),
      limit(5)
    );
    const checkinSnap = await getDocs(checkinQ);
    const checkins = checkinSnap.docs.map(doc => doc.data());
    // Compliance %: average of last 5 check-ins' compliance (assume field 'compliance' 0-100)
    const complianceVals = checkins.map(c => c.compliance ?? 0);
    const compliance = complianceVals.length ? Math.round(complianceVals.reduce((a, b) => a + b, 0) / complianceVals.length) : 0;
    return {
      ...client,
      compliance,
      last5Checkins: checkins
    };
  }));

  return {
    clients: clientData,
    lastDoc: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null
  };
} 