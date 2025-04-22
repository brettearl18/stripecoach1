import { AuthError } from 'firebase/auth';

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'auth/invalid-credential',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  WEAK_PASSWORD = 'auth/weak-password',
  NETWORK_ERROR = 'auth/network-request-failed',
  TOO_MANY_REQUESTS = 'auth/too-many-requests',
  SESSION_EXPIRED = 'auth/session-expired',
  UNKNOWN_ERROR = 'auth/unknown-error'
}

export interface AuthErrorResponse {
  code: AuthErrorCode;
  message: string;
  status: number;
}

export function handleAuthError(error: unknown): AuthErrorResponse {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
          status: 401
        };
      case 'auth/email-already-in-use':
        return {
          code: AuthErrorCode.EMAIL_ALREADY_IN_USE,
          message: 'Email is already in use',
          status: 409
        };
      case 'auth/weak-password':
        return {
          code: AuthErrorCode.WEAK_PASSWORD,
          message: 'Password is too weak',
          status: 400
        };
      case 'auth/network-request-failed':
        return {
          code: AuthErrorCode.NETWORK_ERROR,
          message: 'Network error. Please check your connection',
          status: 503
        };
      case 'auth/too-many-requests':
        return {
          code: AuthErrorCode.TOO_MANY_REQUESTS,
          message: 'Too many attempts. Please try again later',
          status: 429
        };
      default:
        return {
          code: AuthErrorCode.UNKNOWN_ERROR,
          message: 'An unexpected error occurred',
          status: 500
        };
    }
  }

  return {
    code: AuthErrorCode.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
    status: 500
  };
} 