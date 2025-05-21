import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { firebaseConfig } from './config';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

// Password strength validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export const checkLoginAttempts = (email: string): { allowed: boolean; timeLeft?: number } => {
  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (!attempts) {
    loginAttempts.set(email, { count: 0, lastAttempt: now });
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
    // Reset attempts after lockout period
    loginAttempts.set(email, { count: 0, lastAttempt: now });
  }

  return { allowed: true };
};

export const incrementLoginAttempts = (email: string) => {
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: Date.now() };
  loginAttempts.set(email, {
    count: attempts.count + 1,
    lastAttempt: Date.now(),
  });
};

// Enhanced login function with persistence and rate limiting
export const loginWithEmail = async (
  email: string, 
  password: string, 
  rememberMe: boolean = false
) => {
  const rateLimit = checkLoginAttempts(email);
  if (!rateLimit.allowed) {
    return { 
      user: null, 
      error: `Too many login attempts. Please try again in ${rateLimit.timeLeft} minutes.` 
    };
  }

  try {
    // Set persistence based on remember me option
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    incrementLoginAttempts(email);
    return { user: null, error: error.message };
  }
};

// Enhanced registration function with email verification
export const registerWithEmail = async (email: string, password: string) => {
  // Validate password strength
  const { isValid, errors } = validatePassword(password);
  if (!isValid) {
    return { user: null, error: errors.join('\n') };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Send verification email
    await sendEmailVerification(userCredential.user);
    return { 
      user: userCredential.user, 
      error: null,
      message: 'Please check your email to verify your account.' 
    };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Check if email is verified
export const isEmailVerified = (user: User | null): boolean => {
  return user?.emailVerified ?? false;
};

// Resend verification email
export const resendVerificationEmail = async (user: User) => {
  try {
    await sendEmailVerification(user);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const sendResetPasswordEmail = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const handlePasswordReset = async (oobCode: string, newPassword: string) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export { auth }; 