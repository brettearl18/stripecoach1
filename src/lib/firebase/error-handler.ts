import { FirebaseError } from 'firebase/app';

// Error types
export enum ErrorType {
  AUTHENTICATION = 'auth',
  DATABASE = 'database',
  STORAGE = 'storage',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Custom error interface
export interface AppError {
  type: ErrorType;
  code: string;
  message: string;
  severity: ErrorSeverity;
  originalError?: any;
  timestamp: Date;
  context?: Record<string, any>;
}

// Error mapping for Firebase auth errors
const authErrorMap: Record<string, { message: string; severity: ErrorSeverity }> = {
  'auth/invalid-email': {
    message: 'The email address is not valid.',
    severity: ErrorSeverity.WARNING
  },
  'auth/user-disabled': {
    message: 'This account has been disabled.',
    severity: ErrorSeverity.ERROR
  },
  'auth/user-not-found': {
    message: 'No account found with this email.',
    severity: ErrorSeverity.WARNING
  },
  'auth/wrong-password': {
    message: 'Incorrect password.',
    severity: ErrorSeverity.WARNING
  },
  'auth/email-already-in-use': {
    message: 'This email is already registered.',
    severity: ErrorSeverity.WARNING
  },
  'auth/weak-password': {
    message: 'The password is too weak.',
    severity: ErrorSeverity.WARNING
  },
  'auth/requires-recent-login': {
    message: 'Please log in again to perform this action.',
    severity: ErrorSeverity.WARNING
  },
  'auth/too-many-requests': {
    message: 'Too many attempts. Please try again later.',
    severity: ErrorSeverity.ERROR
  }
};

// Error mapping for Firestore errors
const firestoreErrorMap: Record<string, { message: string; severity: ErrorSeverity }> = {
  'permission-denied': {
    message: 'You don\'t have permission to perform this action.',
    severity: ErrorSeverity.ERROR
  },
  'not-found': {
    message: 'The requested document was not found.',
    severity: ErrorSeverity.WARNING
  },
  'already-exists': {
    message: 'The document already exists.',
    severity: ErrorSeverity.WARNING
  },
  'failed-precondition': {
    message: 'Operation was rejected.',
    severity: ErrorSeverity.ERROR
  },
  'resource-exhausted': {
    message: 'Quota exceeded or rate limit reached.',
    severity: ErrorSeverity.CRITICAL
  }
};

// Main error handler
export const handleFirebaseError = (error: any, context?: Record<string, any>): AppError => {
  const timestamp = new Date();
  
  // Handle Firebase errors
  if (error instanceof FirebaseError) {
    const [service, code] = error.code.split('/');
    
    if (service === 'auth') {
      const mappedError = authErrorMap[error.code] || {
        message: 'Authentication error occurred.',
        severity: ErrorSeverity.ERROR
      };
      
      return {
        type: ErrorType.AUTHENTICATION,
        code: error.code,
        message: mappedError.message,
        severity: mappedError.severity,
        originalError: error,
        timestamp,
        context
      };
    }
    
    if (service === 'firestore') {
      const mappedError = firestoreErrorMap[code] || {
        message: 'Database error occurred.',
        severity: ErrorSeverity.ERROR
      };
      
      return {
        type: ErrorType.DATABASE,
        code: error.code,
        message: mappedError.message,
        severity: mappedError.severity,
        originalError: error,
        timestamp,
        context
      };
    }
  }
  
  // Handle network errors
  if (error instanceof Error && error.message.toLowerCase().includes('network')) {
    return {
      type: ErrorType.NETWORK,
      code: 'network-error',
      message: 'Network connection error. Please check your internet connection.',
      severity: ErrorSeverity.ERROR,
      originalError: error,
      timestamp,
      context
    };
  }
  
  // Handle unknown errors
  return {
    type: ErrorType.UNKNOWN,
    code: 'unknown-error',
    message: 'An unexpected error occurred.',
    severity: ErrorSeverity.ERROR,
    originalError: error,
    timestamp,
    context
  };
};

// Error logging
export const logError = (error: AppError): void => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Firebase Error:', {
      type: error.type,
      code: error.code,
      message: error.message,
      severity: error.severity,
      timestamp: error.timestamp,
      context: error.context
    });
  }
  
  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement production error logging
    // e.g., send to logging service, analytics, etc.
  }
}; 