import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { generateInviteToken } from '../utils/tokens';
import { ClientProfile, ClientInvite } from '@/types/client';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auditService } from './auditService';
import { getSession } from 'next-auth/react';

interface NewClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  startDate: string;
  notes: string;
  coachId: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  scoringTierId?: string;
  coachId: string;
  settings: {
    canAccessReports: boolean;
    canAccessAnalytics: boolean;
    canModifyProfile: boolean;
  };
}

class ClientService {
  private async validateCoachAccess(coachEmail: string, clientId: string): Promise<boolean> {
    const clientRef = doc(db, 'clients', clientId);
    const clientSnap = await getDoc(clientRef);
    
    if (!clientSnap.exists()) return false;
    
    const clientData = clientSnap.data();
    return clientData.coachId === coachEmail;
  }

  private async validateUserAccess(userId: string, clientId: string): Promise<{ hasAccess: boolean; role: string }> {
    // During development, always return true access with coach role
    return { hasAccess: true, role: 'coach' };
  }

  async createClientProfile(data: NewClientData): Promise<ClientProfile> {
    const now = new Date();
    const profile: ClientProfile = {
      id: '', // Will be set after document creation
      ...data,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      metrics: {
        checkIns: 0,
        totalSessions: 0,
        consistency: 100,
        daysStreak: 0,
        completionRate: 0
      },
      program: {
        currentWeek: 1,
        totalWeeks: 12,
        phase: 'Onboarding'
      }
    };

    const docRef = await addDoc(collection(db, 'clientProfiles'), profile);
    profile.id = docRef.id;
    
    return profile;
  }

  async createClientInvite(data: NewClientData): Promise<ClientInvite> {
    try {
      // First create the client profile
      const profile = await this.createClientProfile(data);
      
      // Generate invite token and create invite
      const token = generateInviteToken();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const inviteData: ClientInvite = {
        id: '', // Will be set after document creation
        token,
        status: 'pending',
        createdAt: now,
        expiresAt,
        clientProfile: profile
      };

      const docRef = await addDoc(collection(db, 'clientInvites'), {
        ...inviteData,
        createdAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(expiresAt)
      });
      
      inviteData.id = docRef.id;
      
      // Send email invitation here (implement email service integration)
      // TODO: Implement email sending

      return inviteData;
    } catch (error) {
      console.error('Error creating client invite:', error);
      throw new Error('Failed to create client invitation');
    }
  }

  async verifyInvite(token: string): Promise<ClientInvite | null> {
    try {
      const invitesRef = collection(db, 'clientInvites');
      const q = query(invitesRef, where('token', '==', token));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const invite = querySnapshot.docs[0].data() as ClientInvite;
      invite.id = querySnapshot.docs[0].id;

      if (invite.status !== 'pending') {
        return null;
      }

      if (new Date() > invite.expiresAt) {
        await updateDoc(doc(db, 'clientInvites', invite.id), {
          status: 'expired'
        });
        return null;
      }

      return invite;
    } catch (error) {
      console.error('Error verifying invite:', error);
      return null;
    }
  }

  async acceptInvite(token: string): Promise<boolean> {
    try {
      const invite = await this.verifyInvite(token);
      
      if (!invite) {
        return false;
      }

      // Update the client profile status
      const profileRef = doc(db, 'clientProfiles', invite.clientProfile.id);
      await updateDoc(profileRef, {
        status: 'active',
        updatedAt: Timestamp.now()
      });

      // Update invite status
      await updateDoc(doc(db, 'clientInvites', invite.id), {
        status: 'accepted'
      });

      return true;
    } catch (error) {
      console.error('Error accepting invite:', error);
      return false;
    }
  }

  async getClientProfile(clientId: string): Promise<ClientProfile | null> {
    // Return mock data instead of accessing Firebase
    return {
      id: clientId,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      startDate: '2024-01-15',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-20'),
      coachId: 'coach123',
      notes: 'Dedicated client showing great progress',
      metrics: {
        checkIns: 12,
        totalSessions: 24,
        consistency: 85,
        daysStreak: 4,
        completionRate: 85
      },
      program: {
        currentWeek: 8,
        totalWeeks: 12,
        phase: 'Progressive'
      }
    };
  }

  async updateClientProfile(profileId: string, updates: Partial<ClientProfile>): Promise<boolean> {
    try {
      const docRef = doc(db, 'clientProfiles', profileId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating client profile:', error);
      return false;
    }
  }

  async updateClient(clientId: string, updates: Partial<Client>): Promise<void> {
    const session = await getSession();
    if (!session?.user?.email) {
      throw new Error('Unauthorized - Must be logged in');
    }

    // Validate user access
    const { hasAccess, role } = await this.validateUserAccess(session.user.email, clientId);
    if (!hasAccess) {
      throw new Error('Forbidden - No access to this client');
    }

    // Prevent clients from updating restricted fields
    if (role === 'client') {
      const restrictedFields = ['scoringTierId', 'coachId', 'settings'];
      const hasRestrictedFields = restrictedFields.some(field => field in updates);
      if (hasRestrictedFields) {
        throw new Error('Forbidden - Cannot modify restricted fields');
      }
    }

    const clientRef = doc(db, 'clients', clientId);
    const oldData = (await getDoc(clientRef)).data();

    // Update the client
    await updateDoc(clientRef, updates);

    // Audit log the changes
    if (updates.scoringTierId !== undefined && updates.scoringTierId !== oldData?.scoringTierId) {
      await auditService.logScoringTierChange(
        session.user.email,
        clientId,
        oldData?.scoringTierId,
        updates.scoringTierId
      );
    }

    // Log other significant changes
    await auditService.logClientSettingsChange(
      session.user.email,
      clientId,
      updates
    );
  }

  async getClient(clientId: string): Promise<Client | null> {
    // Return mock data instead of accessing Firebase
    return {
      id: clientId,
      name: 'John Smith',
      email: 'john.smith@example.com',
      coachId: 'coach123',
      scoringTierId: 'tier2',
      settings: {
        canAccessReports: true,
        canAccessAnalytics: true,
        canModifyProfile: true
      }
    };
  }

  async getClientsByCoach(coachId: string): Promise<Client[]> {
    const session = await getSession();
    if (!session?.user?.email) {
      throw new Error('Unauthorized - Must be logged in');
    }

    // Only coaches and admins can list clients
    const userRef = doc(db, 'users', session.user.email);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || !['admin', 'coach'].includes(userSnap.data().role)) {
      throw new Error('Forbidden - Insufficient permissions');
    }

    // If coach, ensure they can only see their own clients
    if (userSnap.data().role === 'coach' && session.user.email !== coachId) {
      throw new Error('Forbidden - Can only view own clients');
    }

    const clientsRef = collection(db, 'clients');
    const q = query(clientsRef, where('coachId', '==', coachId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Client[];
  }
}

export const clientService = new ClientService(); 