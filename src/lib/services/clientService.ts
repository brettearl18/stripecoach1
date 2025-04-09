import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { generateInviteToken } from '../utils/tokens';
import { ClientProfile, ClientInvite } from '@/types/client';

interface NewClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  startDate: string;
  notes: string;
  coachId: string;
}

export const clientService = {
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
  },

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
  },

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
  },

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
  },

  async getClientProfile(profileId: string): Promise<ClientProfile | null> {
    try {
      const docRef = doc(db, 'clientProfiles', profileId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return {
        ...docSnap.data(),
        id: docSnap.id
      } as ClientProfile;
    } catch (error) {
      console.error('Error getting client profile:', error);
      return null;
    }
  },

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
}; 