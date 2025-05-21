"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.handleFirebaseError = exports.ErrorSeverity = exports.ErrorType = void 0;
var app_1 = require("firebase/app");
// Error types
var ErrorType;
(function (ErrorType) {
    ErrorType["AUTHENTICATION"] = "auth";
    ErrorType["DATABASE"] = "database";
    ErrorType["STORAGE"] = "storage";
    ErrorType["VALIDATION"] = "validation";
    ErrorType["PERMISSION"] = "permission";
    ErrorType["NETWORK"] = "network";
    ErrorType["UNKNOWN"] = "unknown";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
// Error severity levels
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["INFO"] = "info";
    ErrorSeverity["WARNING"] = "warning";
    ErrorSeverity["ERROR"] = "error";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
// Error mapping for Firebase auth errors
var authErrorMap = {
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
var firestoreErrorMap = {
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
var handleFirebaseError = function (error, context) {
    var timestamp = new Date();
    // Handle Firebase errors
    if (error instanceof app_1.FirebaseError) {
        var _a = error.code.split('/'), service = _a[0], code = _a[1];
        if (service === 'auth') {
            var mappedError = authErrorMap[error.code] || {
                message: 'Authentication error occurred.',
                severity: ErrorSeverity.ERROR
            };
            return {
                type: ErrorType.AUTHENTICATION,
                code: error.code,
                message: mappedError.message,
                severity: mappedError.severity,
                originalError: error,
                timestamp: timestamp,
                context: context
            };
        }
        if (service === 'firestore') {
            var mappedError = firestoreErrorMap[code] || {
                message: 'Database error occurred.',
                severity: ErrorSeverity.ERROR
            };
            return {
                type: ErrorType.DATABASE,
                code: error.code,
                message: mappedError.message,
                severity: mappedError.severity,
                originalError: error,
                timestamp: timestamp,
                context: context
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
            timestamp: timestamp,
            context: context
        };
    }
    // Handle unknown errors
    return {
        type: ErrorType.UNKNOWN,
        code: 'unknown-error',
        message: 'An unexpected error occurred.',
        severity: ErrorSeverity.ERROR,
        originalError: error,
        timestamp: timestamp,
        context: context
    };
};
exports.handleFirebaseError = handleFirebaseError;
// Error logging
var logError = function (error) {
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
exports.logError = logError;
