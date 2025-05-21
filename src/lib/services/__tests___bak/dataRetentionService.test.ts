import { DataRetentionService } from '../dataRetentionService';
import { SecurityService } from '../securityService';
import { AuthService } from '../authService';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getFirestore: jest.fn()
}));

jest.mock('@/lib/firebase', () => ({
  db: {}
}));

jest.mock('../securityService');
jest.mock('../authService');

describe('DataRetentionService', () => {
  let dataRetentionService: DataRetentionService;
  let securityService: jest.Mocked<SecurityService>;
  let authService: jest.Mocked<AuthService>;

  const mockUserId = 'test-user-id';
  const mockRetentionPeriod = 30; // days
  const mockExpiredDate = new Date();
  mockExpiredDate.setDate(mockExpiredDate.getDate() - mockRetentionPeriod - 1);

  beforeEach(() => {
    jest.clearAllMocks();
    
    securityService = {
      getSecuritySettings: jest.fn(),
      logAuditEvent: jest.fn()
    } as unknown as jest.Mocked<SecurityService>;

    authService = {
      getUser: jest.fn(),
      signOut: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    securityService.getSecuritySettings.mockResolvedValue({
      dataRetentionPeriod: mockRetentionPeriod
    });

    dataRetentionService = new DataRetentionService(securityService, authService);
  });

  describe('cleanupExpiredData', () => {
    it('should delete expired data', async () => {
      securityService.getSecuritySettings.mockResolvedValue({
        dataRetentionPeriod: 30
      });

      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        docs: [
          { id: 'doc1', ref: {} },
          { id: 'doc2', ref: {} }
        ],
        size: 2
      });
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await dataRetentionService.cleanupExpiredData();

      expect(collection).toHaveBeenCalledWith(db, 'users');
      expect(where).toHaveBeenCalledWith('createdAt', '<', expect.any(Date));
      expect(deleteDoc).toHaveBeenCalledTimes(2);
      expect(securityService.logAuditEvent).toHaveBeenCalledWith({
        action: 'data_cleanup',
        details: 'Cleaned up 2 expired records',
        timestamp: expect.any(Date)
      });
    });

    it('should handle no expired data', async () => {
      securityService.getSecuritySettings.mockResolvedValue({
        dataRetentionPeriod: 30
      });

      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        docs: [],
        size: 0
      });

      await dataRetentionService.cleanupExpiredData();

      expect(deleteDoc).not.toHaveBeenCalled();
      expect(securityService.logAuditEvent).toHaveBeenCalledWith({
        action: 'data_cleanup',
        details: 'Cleaned up 0 expired records',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('deleteUserData', () => {
    it('should delete all user data', async () => {
      const mockUser = { id: mockUserId };
      authService.getUser.mockResolvedValue(mockUser);
      (doc as jest.Mock).mockReturnValue({});
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await dataRetentionService.deleteUserData(mockUserId);

      expect(authService.getUser).toHaveBeenCalledWith(mockUserId);
      expect(deleteDoc).toHaveBeenCalled();
      expect(securityService.logAuditEvent).toHaveBeenCalledWith({
        action: 'data_deletion',
        userId: mockUserId,
        details: `Deleted all data for user ${mockUserId}`,
        timestamp: expect.any(Date)
      });
    });

    it('should throw error for non-existent user', async () => {
      authService.getUser.mockResolvedValue(null);

      await expect(dataRetentionService.deleteUserData(mockUserId))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('getDataRetentionPeriod', () => {
    it('should return configured retention period', async () => {
      const period = await dataRetentionService.getDataRetentionPeriod();

      expect(period).toBe(mockRetentionPeriod);
      expect(securityService.getSecuritySettings).toHaveBeenCalled();
    });
  });

  describe('updateDataRetentionPeriod', () => {
    it('should update retention period', async () => {
      const newPeriod = 60;

      await dataRetentionService.updateDataRetentionPeriod(newPeriod);

      expect(securityService.logAuditEvent).toHaveBeenCalledWith({
        action: 'retention_period_update',
        details: `Updated data retention period to ${newPeriod} days`,
        timestamp: expect.any(Date)
      });
    });

    it('should throw error for invalid period', async () => {
      await expect(dataRetentionService.updateDataRetentionPeriod(-1))
        .rejects
        .toThrow('Invalid retention period');
    });
  });
}); 