import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';

interface AuditLog {
  action: string;
  performedBy: string;
  targetId: string;
  details: any;
  timestamp: any;
}

class AuditService {
  private async logAction(log: Omit<AuditLog, 'timestamp'>) {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        ...log,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - we don't want audit logging to break the main flow
    }
  }

  async getClientLogs(clientId: string): Promise<AuditLog[]> {
    try {
      const logsRef = collection(db, 'audit_logs');
      const q = query(
        logsRef,
        where('targetId', '==', clientId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as AuditLog[];
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }

  async logScoringTierChange(coachEmail: string, clientId: string, oldTier: string | undefined, newTier: string) {
    await this.logAction({
      action: 'SCORING_TIER_CHANGE',
      performedBy: coachEmail,
      targetId: clientId,
      details: {
        oldTier,
        newTier,
        changeType: 'scoring_tier_update'
      }
    });
  }

  // Add more audit logging methods as needed
  async logClientSettingsChange(coachEmail: string, clientId: string, changes: Record<string, any>) {
    await this.logAction({
      action: 'CLIENT_SETTINGS_UPDATE',
      performedBy: coachEmail,
      targetId: clientId,
      details: {
        changes,
        changeType: 'settings_update'
      }
    });
  }
}

export const auditService = new AuditService(); 