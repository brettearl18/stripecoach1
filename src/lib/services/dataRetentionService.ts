import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SecurityService } from './securityService';
import { AuthService } from './authService';

export class DataRetentionService {
  constructor(
    private securityService: SecurityService,
    private authService: AuthService
  ) {}

  async cleanupExpiredData(): Promise<void> {
    const settings = await this.securityService.getSecuritySettings();
    if (!settings) {
      throw new Error('Security settings not found');
    }

    const retentionPeriod = settings.dataRetentionPeriod;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);

    const usersRef = collection(db, 'users');
    const expiredQuery = query(usersRef, where('createdAt', '<', cutoffDate));
    const expiredDocs = await getDocs(expiredQuery);

    for (const expiredDoc of expiredDocs.docs) {
      await deleteDoc(doc(db, 'users', expiredDoc.id));
    }

    await this.securityService.logAuditEvent({
      action: 'data_cleanup',
      details: `Cleaned up ${expiredDocs.size} expired records`,
      timestamp: new Date()
    });
  }

  async deleteUserData(userId: string): Promise<void> {
    const user = await this.authService.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete user document
    await deleteDoc(doc(db, 'users', userId));

    // Log the deletion
    await this.securityService.logAuditEvent({
      action: 'data_deletion',
      userId,
      details: `Deleted all data for user ${userId}`,
      timestamp: new Date()
    });
  }

  async getDataRetentionPeriod(): Promise<number> {
    const settings = await this.securityService.getSecuritySettings();
    return settings?.dataRetentionPeriod || 30; // Default to 30 days
  }

  async updateDataRetentionPeriod(days: number): Promise<void> {
    if (days < 0) {
      throw new Error('Invalid retention period');
    }

    await this.securityService.logAuditEvent({
      action: 'retention_period_update',
      details: `Updated data retention period to ${days} days`,
      timestamp: new Date()
    });
  }
} 