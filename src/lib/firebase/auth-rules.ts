import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';

// Password strength validation
export const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  maxLength: 128
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < passwordRules.minLength) {
    errors.push(`Password must be at least ${passwordRules.minLength} characters long`);
  }
  if (password.length > passwordRules.maxLength) {
    errors.push(`Password must be less than ${passwordRules.maxLength} characters`);
  }
  if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (passwordRules.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (passwordRules.requireSpecialChar && !/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting for authentication attempts
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const attemptTracker = new Map<string, { count: number; lastAttempt: number }>();

export const checkAuthAttempts = (identifier: string): { allowed: boolean; timeLeft?: number } => {
  const now = Date.now();
  const attempts = attemptTracker.get(identifier);

  if (!attempts) {
    attemptTracker.set(identifier, { count: 0, lastAttempt: now });
    return { allowed: true };
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    const timeSinceLastAttempt = now - attempts.lastAttempt;
    if (timeSinceLastAttempt < LOCKOUT_DURATION) {
      return {
        allowed: false,
        timeLeft: Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 1000 / 60)
      };
    }
    attemptTracker.set(identifier, { count: 0, lastAttempt: now });
  }

  return { allowed: true };
};

export const incrementAuthAttempts = (identifier: string): void => {
  const attempts = attemptTracker.get(identifier) || { count: 0, lastAttempt: Date.now() };
  attemptTracker.set(identifier, {
    count: attempts.count + 1,
    lastAttempt: Date.now()
  });
};

// Role-based access control
export const Roles = {
  ADMIN: 'admin',
  COACH: 'coach',
  CLIENT: 'client'
} as const;

export type UserRole = typeof Roles[keyof typeof Roles];

export const checkUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data().role as UserRole : null;
  } catch (error) {
    console.error('Error checking user role:', error);
    return null;
  }
};

// Session management
export const MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const checkSessionValidity = async (): Promise<boolean> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return false;

  try {
    const token = await user.getIdTokenResult();
    const authTime = new Date(token.authTime).getTime();
    const now = Date.now();

    // Check if the session is expired
    if (now - authTime > MAX_SESSION_DURATION) {
      await auth.signOut();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
}; 