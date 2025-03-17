import { FirebaseError } from 'firebase/app';

type FirebaseAuthError = {
  code: string;
  message: string;
};

export function useFirebaseError() {
  const getAuthErrorMessage = (error: unknown): string => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return 'This email is already registered. Please sign in instead.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/operation-not-allowed':
          return 'This sign-in method is not enabled. Please contact support.';
        case 'auth/weak-password':
          return 'Please choose a stronger password (at least 6 characters).';
        case 'auth/user-disabled':
          return 'This account has been disabled. Please contact support.';
        case 'auth/user-not-found':
          return 'No account found with this email. Please sign up instead.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/invalid-credential':
          return 'Invalid credentials. Please check your email and password.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
          return 'Network error. Please check your internet connection.';
        case 'auth/popup-closed-by-user':
          return 'Sign-in popup was closed before completing. Please try again.';
        default:
          return 'An error occurred during authentication. Please try again.';
      }
    }
    return 'An unexpected error occurred. Please try again.';
  };

  return { getAuthErrorMessage };
} 