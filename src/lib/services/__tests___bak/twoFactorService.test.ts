import { TwoFactorService } from '../twoFactorService';
import { SecurityService } from '../securityService';
import { AuthService } from '../authService';
import { DataRetentionService } from '../dataRetentionService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authenticator } from 'otplib';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ path: 'users/test-user-id' })),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  getFirestore: jest.fn()
}));

jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {
    currentUser: null
  }
}));

jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn(),
    keyuri: jest.fn(),
    verify: jest.fn(),
    generate: jest.fn()
  }
}));

jest.mock('../securityService');
jest.mock('../authService');
jest.mock('../dataRetentionService');
jest.mock('../emailService', () => ({
  send2FAEnabledEmail: jest.fn(),
  send2FADisabledEmail: jest.fn(),
  sendBackupCodesRegeneratedEmail: jest.fn()
}));

describe('TwoFactorService', () => {
  let twoFactorService: TwoFactorService;
  let securityService: jest.Mocked<SecurityService>;
  let authService: jest.Mocked<AuthService>;
  let dataRetentionService: jest.Mocked<DataRetentionService>;

  const mockUserId = 'test-user-id';
  const mockSecret = 'test-secret';
  const mockCode = '123456';
  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    twoFactorMethod: '2fa',
    twoFactorSecret: mockSecret,
    twoFactorCode: mockCode,
    twoFactorBackupCodes: ['code1', 'code2', 'code3']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    securityService = {
      getSecuritySettings: jest.fn(),
      logAuditEvent: jest.fn()
    } as unknown as jest.Mocked<SecurityService>;

    authService = {
      authenticateUser: jest.fn(),
      updateLastLogin: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    dataRetentionService = {
      cleanupExpiredData: jest.fn(),
      deleteUserData: jest.fn()
    } as unknown as jest.Mocked<DataRetentionService>;

    securityService.getSecuritySettings.mockResolvedValue({
      twoFactorEnabled: true,
      twoFactorMethod: '2fa',
      backupCodes: mockUser.twoFactorBackupCodes
    });

    authService.getUser.mockResolvedValue(mockUser);

    (authenticator.generateSecret as jest.Mock).mockReturnValue(mockSecret);
    (authenticator.keyuri as jest.Mock).mockReturnValue('otpauth://totp/test');
    (authenticator.verify as jest.Mock).mockReturnValue(true);
    (authenticator.generate as jest.Mock).mockReturnValue(mockCode);

    twoFactorService = new TwoFactorService(securityService, authService, dataRetentionService);
  });

  describe('setupTwoFactor', () => {
    it('should set up authenticator app 2FA', async () => {
      const result = await twoFactorService.setupTwoFactor(mockUserId, '2fa');

      expect(result).toEqual({
        secret: mockSecret,
        qrCode: 'otpauth://totp/test'
      });
      expect(authenticator.generateSecret).toHaveBeenCalled();
      expect(authenticator.keyuri).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          twoFactorSecret: mockSecret,
          twoFactorMethod: '2fa',
          twoFactorEnabled: true,
          twoFactorVerified: false
        }
      );
    });

    it('should set up SMS 2FA', async () => {
      const result = await twoFactorService.setupTwoFactor(mockUserId, 'sms');

      expect(result).toEqual({
        code: mockCode
      });
      expect(authenticator.generate).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          twoFactorMethod: 'sms',
          twoFactorEnabled: true,
          twoFactorVerified: false
        }
      );
    });

    it('should set up email 2FA', async () => {
      const result = await twoFactorService.setupTwoFactor(mockUserId, 'email');

      expect(result).toEqual({
        code: mockCode
      });
      expect(authenticator.generate).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          twoFactorMethod: 'email',
          twoFactorEnabled: true,
          twoFactorVerified: false
        }
      );
    });

    it('should throw error for invalid method', async () => {
      await expect(twoFactorService.setupTwoFactor(mockUserId, 'invalid' as any))
        .rejects
        .toThrow('Invalid 2FA method');
    });
  });

  describe('verifyTwoFactor', () => {
    it('should verify authenticator app code', async () => {
      const result = await twoFactorService.verifyTwoFactor(mockUserId, mockCode, '2fa');

      expect(result).toBe(true);
      expect(authenticator.verify).toHaveBeenCalledWith({
        token: mockCode,
        secret: mockSecret
      });
      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          twoFactorVerified: true
        }
      );
    });

    it('should verify SMS code', async () => {
      const result = await twoFactorService.verifyTwoFactor(mockUserId, mockCode, 'sms');

      expect(result).toBe(true);
      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          twoFactorVerified: true
        }
      );
    });

    it('should verify email code', async () => {
      const result = await twoFactorService.verifyTwoFactor(mockUserId, mockCode, 'email');

      expect(result).toBe(true);
      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          twoFactorVerified: true
        }
      );
    });

    it('should verify backup code', async () => {
      const result = await twoFactorService.verifyTwoFactor(mockUserId, mockUser.twoFactorBackupCodes[0], 'backup');

      expect(result).toBe(true);
      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          twoFactorBackupCodes: ['code2', 'code3'],
          twoFactorVerified: true
        }
      );
    });

    it('should throw error for invalid code', async () => {
      (authenticator.verify as jest.Mock).mockReturnValueOnce(false);

      await expect(twoFactorService.verifyTwoFactor(mockUserId, 'invalid', '2fa'))
        .rejects
        .toThrow('Invalid verification code');
    });
  });

  describe('disableTwoFactor', () => {
    it('should disable 2FA', async () => {
      await twoFactorService.disableTwoFactor(mockUserId);

      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          twoFactorEnabled: false,
          twoFactorMethod: null,
          twoFactorSecret: null,
          twoFactorPhoneNumber: null,
          twoFactorBackupCodes: null,
          twoFactorVerified: false
        }
      );
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate new backup codes', async () => {
      const result = await twoFactorService.generateBackupCodes(mockUserId);

      expect(result).toHaveLength(8);
      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          twoFactorBackupCodes: expect.any(Array)
        }
      );
    });
  });

  describe('isTwoFactorRequired', () => {
    it('should return true when 2FA is required', async () => {
      const result = await twoFactorService.isTwoFactorRequired(mockUserId);

      expect(result).toBe(true);
    });

    it('should return false when 2FA is not required', async () => {
      securityService.getSecuritySettings.mockResolvedValueOnce({
        twoFactorEnabled: false,
        twoFactorMethod: null,
        backupCodes: []
      });

      const result = await twoFactorService.isTwoFactorRequired(mockUserId);

      expect(result).toBe(false);
    });
  });
}); 