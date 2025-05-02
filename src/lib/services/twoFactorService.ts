import { authenticator } from 'otplib';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, increment, serverTimestamp } from 'firebase/firestore';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { send2FAEnabledEmail, send2FADisabledEmail, sendBackupCodesRegeneratedEmail } from './emailService';
import { getAuth } from 'firebase/auth';
import { SecurityService } from './securityService';
import { sendEmail } from '../utils/email';
import { sendSMS } from '../utils/sms';
import { AuthService } from './authService';
import { DataRetentionService } from './dataRetentionService';
import { mockSendEmail } from '@/lib/sendgrid';

export interface TwoFactorSecret {
  secret: string;
  qrCode: string;
}

export interface TwoFactorStatus {
  isEnabled: boolean;
  isVerified: boolean;
  method: '2fa' | 'sms' | 'email' | null;
}

export interface RateLimitInfo {
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const BACKUP_CODES_COUNT = 8;
const BACKUP_CODE_LENGTH = 10;

const TWO_FACTOR_COLLECTION = 'twoFactor';

interface TwoFactorSettings {
  userId: string;
  enabled: boolean;
  method: 'authenticator' | 'sms' | 'email';
  secret?: string;
  phoneNumber?: string;
  email?: string;
  backupCodes: string[];
  lastVerified: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TwoFactorMethod = '2fa' | 'sms' | 'email';

export interface TwoFactorSetupResult {
  secret?: string;
  qrCode?: string;
  code?: string;
}

export class TwoFactorService {
  private static instance: TwoFactorService;
  private readonly MAX_ATTEMPTS = 5;
  private readonly ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

  constructor(
    private securityService: SecurityService,
    private authService: AuthService,
    private dataRetentionService: DataRetentionService
  ) {}

  static getInstance(): TwoFactorService {
    if (!TwoFactorService.instance) {
      TwoFactorService.instance = new TwoFactorService(
        SecurityService.getInstance(),
        AuthService.getInstance(),
        DataRetentionService.getInstance()
      );
    }
    return TwoFactorService.instance;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
      const code = crypto.randomBytes(5).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  private async checkRateLimit(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const rateLimit = userData.rateLimit || { attempts: 0, lastAttempt: null };

    if (rateLimit.lastAttempt) {
      const timeSinceLastAttempt = Date.now() - rateLimit.lastAttempt.toDate().getTime();
      if (timeSinceLastAttempt < LOCKOUT_DURATION && rateLimit.attempts >= MAX_ATTEMPTS) {
        throw new Error('Too many attempts. Please try again later.');
      }
      if (timeSinceLastAttempt >= LOCKOUT_DURATION) {
        rateLimit.attempts = 0;
      }
    }
  }

  private async updateRateLimit(userId: string, isSuccess: boolean): Promise<void> {
    const userRef = doc(db, 'users', userId);
    if (isSuccess) {
      await updateDoc(userRef, {
        'rateLimit.attempts': 0,
        'rateLimit.lastAttempt': serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        'rateLimit.attempts': increment(1),
        'rateLimit.lastAttempt': serverTimestamp()
      });
    }
  }

  private async generateBackupCodesFile(backupCodes: string[]): Promise<string> {
    const content = [
      '=== BACKUP CODES ===',
      'Keep these backup codes in a safe place.',
      'Each code can only be used once.',
      '',
      ...backupCodes,
      '',
      '=== INSTRUCTIONS ===',
      '1. Use these codes if you cannot access your authenticator app',
      '2. Each code can only be used once',
      '3. Generate new codes if you run out or suspect they are compromised'
    ].join('\n');

    return content;
  }

  private async generateTwoFactorSecret(userId: string, email: string): Promise<TwoFactorSecret> {
    try {
      // Generate secret
      const secret = authenticator.generateSecret();

      // Generate QR code URI
      const uri = authenticator.keyuri(
        email,
        'Stripe Coach',
        secret
      );

      // Generate QR code
      const qrCode = await QRCode.toDataURL(uri);

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Save to database
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'twoFactor.secret': secret,
        'twoFactor.isEnabled': false,
        'twoFactor.isVerified': false,
        'twoFactor.backupCodes': backupCodes,
        'rateLimit': {
          attempts: 0,
          lastAttempt: new Date(),
        }
      });

      return {
        secret,
        qrCode,
      };
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      throw new Error('Failed to generate 2FA secret');
    }
  }

  public async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    try {
      await this.checkRateLimit(userId);

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const twoFactorData = userData.twoFactor;

      if (!twoFactorData || !twoFactorData.secret) {
        throw new Error('2FA not set up');
      }

      let isValid = authenticator.verify({
        token,
        secret: twoFactorData.secret
      });

      if (!isValid && twoFactorData.backupCodes) {
        // Check backup codes
        const backupCodes = twoFactorData.backupCodes;
        const backupCodeIndex = backupCodes.indexOf(token);
        
        if (backupCodeIndex !== -1) {
          // Remove used backup code
          backupCodes.splice(backupCodeIndex, 1);
          await updateDoc(userRef, {
            'twoFactor.backupCodes': backupCodes
          });
          isValid = true;
        }
      }

      await this.updateRateLimit(userId, isValid);

      if (isValid) {
        await updateDoc(userRef, {
          'twoFactor.isEnabled': true,
          'twoFactor.isVerified': true,
          'twoFactor.lastVerified': serverTimestamp()
        });
      }

      return isValid;
    } catch (error) {
      console.error('Error verifying 2FA token:', error);
      throw error;
    }
  }

  public async disableTwoFactor(userId: string, token: string): Promise<void> {
    try {
      const isValid = await this.verifyTwoFactorToken(userId, token);

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'twoFactor.isEnabled': false,
        'twoFactor.isVerified': false,
        'twoFactor.secret': null,
        'twoFactor.backupCodes': null,
      });

      await send2FADisabledEmail(userId);
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }

  public async getTwoFactorStatus(userId: string): Promise<TwoFactorStatus> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const twoFactorData = userData.twoFactor || {};

      return {
        isEnabled: twoFactorData.isEnabled || false,
        isVerified: twoFactorData.isVerified || false,
        method: twoFactorData.method || null
      };
    } catch (error) {
      console.error('Error getting 2FA status:', error);
      throw error;
    }
  }

  async setupTwoFactor(userId: string, method: TwoFactorMethod): Promise<TwoFactorSetupResult> {
    const user = await this.authService.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    switch (method) {
      case '2fa': {
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, 'Stripe Coach', secret);

        await updateDoc(doc(db, 'users', userId), {
          twoFactorSecret: secret,
          twoFactorMethod: '2fa',
          twoFactorEnabled: true,
          twoFactorVerified: false
        });

        return {
          secret,
          qrCode: otpauth
        };
      }
      case 'sms': {
        if (!user.phoneNumber) {
          throw new Error('Phone number is required for SMS 2FA');
        }

        const code = authenticator.generate(authenticator.generateSecret());
        await updateDoc(doc(db, 'users', userId), {
          twoFactorMethod: 'sms',
          twoFactorEnabled: true,
          twoFactorVerified: false
        });

        return { code };
      }
      case 'email': {
        const code = authenticator.generate(authenticator.generateSecret());
        await updateDoc(doc(db, 'users', userId), {
          twoFactorMethod: 'email',
          twoFactorEnabled: true,
          twoFactorVerified: false
        });

        return { code };
      }
      default:
        throw new Error('Invalid 2FA method');
    }
  }

  private async sendVerificationCode(destination: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Send code via email or SMS based on destination format
    if (destination.includes('@')) {
      // Send via email
      // TODO: Implement email sending
      console.log('Sending code via email:', code);
    } else {
      // Send via SMS
      // TODO: Implement SMS sending
      console.log('Sending code via SMS:', code);
    }

    // Store the code in Firestore with expiration
    const codeRef = doc(db, 'verificationCodes', destination);
    await updateDoc(codeRef, {
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiration
    });
  }

  private async verifyStoredCode(userId: string, code: string): Promise<boolean> {
    const codeDoc = await getDoc(doc(db, 'verificationCodes', userId));
    if (!codeDoc.exists()) return false;

    const { code: storedCode, expiresAt } = codeDoc.data();
    if (new Date() > expiresAt.toDate()) return false;

    return code === storedCode;
  }

  async verifyTwoFactor(userId: string, code: string, method: TwoFactorMethod | 'backup'): Promise<boolean> {
    const user = await this.authService.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    switch (method) {
      case '2fa': {
        const isValid = authenticator.verify({
          token: code,
          secret: user.twoFactorSecret
        });

        if (isValid) {
          await updateDoc(doc(db, 'users', userId), {
            twoFactorVerified: true
          });
          return true;
        }
        break;
      }
      case 'sms':
      case 'email': {
        // Verify code sent via SMS/email
        const isValid = code === user.twoFactorCode;
        if (isValid) {
          await updateDoc(doc(db, 'users', userId), {
            twoFactorVerified: true
          });
          return true;
        }
        break;
      }
      case 'backup': {
        if (user.twoFactorBackupCodes?.includes(code)) {
          const remainingCodes = user.twoFactorBackupCodes.filter(c => c !== code);
          await updateDoc(doc(db, 'users', userId), {
            twoFactorBackupCodes: remainingCodes,
            twoFactorVerified: true
          });
          return true;
        }
        break;
      }
    }

    throw new Error('Invalid verification code');
  }

  async disableTwoFactor(userId: string): Promise<boolean> {
    await updateDoc(doc(db, 'users', userId), {
      twoFactorEnabled: false,
      twoFactorMethod: null,
      twoFactorSecret: null,
      twoFactorPhoneNumber: null,
      twoFactorBackupCodes: null,
      twoFactorVerified: false
    });

    return true;
  }

  async generateBackupCodes(userId: string): Promise<string[]> {
    const codes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 12).toUpperCase()
    );

    await updateDoc(doc(db, 'users', userId), {
      twoFactorBackupCodes: codes
    });

    return codes;
  }

  async isTwoFactorRequired(userId: string): Promise<boolean> {
    const settings = await this.securityService.getSecuritySettings();
    return settings?.twoFactorEnabled || false;
  }

  private async checkRateLimit(userId: string): Promise<{ allowed: boolean; waitTime: number }> {
    const user = await this.authService.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = Date.now();
    const lastAttempt = user.rateLimit?.lastAttempt?.toDate()?.getTime() || 0;
    const attempts = user.rateLimit?.attempts || 0;

    if (attempts >= this.MAX_ATTEMPTS) {
      const waitTime = this.ATTEMPT_WINDOW - (now - lastAttempt);
      if (waitTime > 0) {
        return { allowed: false, waitTime };
      }
      // Reset attempts if window has passed
      await updateDoc(doc(db, 'users', userId), {
        'rateLimit.attempts': 0,
        'rateLimit.lastAttempt': null
      });
    }

    return { allowed: true, waitTime: 0 };
  }
} 