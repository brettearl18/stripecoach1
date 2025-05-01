import { authenticator } from 'otplib';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { send2FAEnabledEmail, send2FADisabledEmail, sendBackupCodesRegeneratedEmail } from './emailService';

export interface TwoFactorSecret {
  secret: string;
  uri: string;
  qrCode: string;
}

export interface TwoFactorStatus {
  isEnabled: boolean;
  isVerified: boolean;
  backupCodes?: string[];
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

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    const code = crypto.randomBytes(BACKUP_CODE_LENGTH)
      .toString('hex')
      .toUpperCase()
      .slice(0, BACKUP_CODE_LENGTH);
    codes.push(code);
  }
  return codes;
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return true;
  }
  
  const userData = userDoc.data();
  const rateLimit = userData.rateLimit as RateLimitInfo;
  
  if (!rateLimit) {
    return true;
  }
  
  // Check if user is locked out
  if (rateLimit.lockedUntil && new Date(rateLimit.lockedUntil) > new Date()) {
    throw new Error(`Account is locked. Try again after ${new Date(rateLimit.lockedUntil).toLocaleString()}`);
  }
  
  // Reset attempts if last attempt was more than 24 hours ago
  if (rateLimit.lastAttempt && (new Date().getTime() - new Date(rateLimit.lastAttempt).getTime() > 24 * 60 * 60 * 1000)) {
    await updateDoc(userRef, {
      'rateLimit.attempts': 0,
      'rateLimit.lastAttempt': new Date(),
    });
    return true;
  }
  
  return rateLimit.attempts < MAX_ATTEMPTS;
}

async function updateRateLimit(userId: string, success: boolean): Promise<void> {
  const userRef = doc(db, 'users', userId);
  
  if (success) {
    // Reset attempts on successful verification
    await updateDoc(userRef, {
      'rateLimit.attempts': 0,
      'rateLimit.lastAttempt': new Date(),
      'rateLimit.lockedUntil': null,
    });
  } else {
    // Increment attempts and check for lockout
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const currentAttempts = (userData?.rateLimit?.attempts || 0) + 1;
    
    if (currentAttempts >= MAX_ATTEMPTS) {
      // Lock the account
      const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
      await updateDoc(userRef, {
        'rateLimit.attempts': currentAttempts,
        'rateLimit.lastAttempt': new Date(),
        'rateLimit.lockedUntil': lockedUntil,
      });
      throw new Error(`Too many failed attempts. Account locked until ${lockedUntil.toLocaleString()}`);
    } else {
      await updateDoc(userRef, {
        'rateLimit.attempts': increment(1),
        'rateLimit.lastAttempt': new Date(),
      });
    }
  }
}

export function generateBackupCodesFile(backupCodes: string[]): string {
  const content = [
    'STRIPE COACH - TWO-FACTOR AUTHENTICATION BACKUP CODES',
    '=================================================',
    '',
    'Store these backup codes in a secure location. Each code can only be used once.',
    'Generated on: ' + new Date().toLocaleString(),
    '',
    ...backupCodes,
    '',
    'Note: If you lose access to your authenticator app and run out of backup codes,',
    'you will need to contact support to regain access to your account.',
  ].join('\n');

  return content;
}

export async function generateTwoFactorSecret(userId: string, email: string): Promise<TwoFactorSecret> {
  try {
    // Generate a secret
    const secret = authenticator.generateSecret();
    
    // Create the URI for the QR code
    const uri = authenticator.keyuri(
      email,
      'Stripe Coach',
      secret
    );
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(uri);
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    
    // Store the secret and backup codes in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'twoFactor.secret': secret,
      'twoFactor.isEnabled': false,
      'twoFactor.isVerified': false,
      'twoFactor.backupCodes': backupCodes,
      'rateLimit': {
        attempts: 0,
        lastAttempt: new Date(),
      },
    });
    
    return {
      secret,
      uri,
      qrCode,
    };
  } catch (error) {
    console.error('Error generating 2FA secret:', error);
    throw error;
  }
}

export async function verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
  try {
    // Check rate limit
    await checkRateLimit(userId);
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const secret = userData.twoFactor?.secret;
    const backupCodes = userData.twoFactor?.backupCodes || [];
    
    if (!secret) {
      throw new Error('2FA not set up for this user');
    }
    
    // Check if token is a backup code
    const isBackupCode = backupCodes.includes(token);
    let isValid = false;
    
    if (isBackupCode) {
      // Remove used backup code
      const updatedBackupCodes = backupCodes.filter(code => code !== token);
      await updateDoc(userRef, {
        'twoFactor.backupCodes': updatedBackupCodes,
      });
      isValid = true;
    } else {
      // Verify TOTP token
      isValid = authenticator.verify({
        token,
        secret,
      });
    }
    
    if (isValid && !userData.twoFactor.isVerified) {
      // First successful verification - enable 2FA
      await updateDoc(userRef, {
        'twoFactor.isEnabled': true,
        'twoFactor.isVerified': true,
      });
      
      // Send email notification
      await send2FAEnabledEmail(userId);
    }
    
    // Update rate limit
    await updateRateLimit(userId, isValid);
    
    return isValid;
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    throw error;
  }
}

export async function disableTwoFactor(userId: string, token: string): Promise<boolean> {
  try {
    // Check rate limit
    await checkRateLimit(userId);
    
    // Verify the token one last time before disabling
    const isValid = await verifyTwoFactorToken(userId, token);
    
    if (!isValid) {
      return false;
    }
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'twoFactor.isEnabled': false,
      'twoFactor.isVerified': false,
      'twoFactor.secret': null,
      'twoFactor.backupCodes': null,
    });
    
    // Send email notification
    await send2FADisabledEmail(userId);
    
    return true;
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    throw error;
  }
}

export async function getTwoFactorStatus(userId: string): Promise<TwoFactorStatus> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    return {
      isEnabled: userData.twoFactor?.isEnabled ?? false,
      isVerified: userData.twoFactor?.isVerified ?? false,
      backupCodes: userData.twoFactor?.backupCodes,
    };
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    throw error;
  }
}

export async function regenerateBackupCodes(userId: string, token: string): Promise<string[]> {
  try {
    // Check rate limit
    await checkRateLimit(userId);
    
    // Verify the token before regenerating backup codes
    const isValid = await verifyTwoFactorToken(userId, token);
    
    if (!isValid) {
      throw new Error('Invalid verification code');
    }
    
    const backupCodes = generateBackupCodes();
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      'twoFactor.backupCodes': backupCodes,
    });
    
    // Send email notification
    await sendBackupCodesRegeneratedEmail(userId);
    
    return backupCodes;
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    throw error;
  }
} 