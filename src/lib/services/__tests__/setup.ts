// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn()
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  getFirestore: jest.fn(() => ({})),
  Timestamp: {
    fromDate: jest.fn(date => ({
      toDate: () => date,
      toMillis: () => date.getTime()
    })),
    now: jest.fn(() => ({
      toDate: () => new Date(),
      toMillis: () => Date.now()
    }))
  },
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn()
  })),
  increment: jest.fn(value => value)
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com'
    }
  })),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn()
}));

// Mock Firebase Performance
jest.mock('firebase/performance', () => ({
  getPerformance: jest.fn(() => ({})),
  trace: jest.fn()
}));

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn()
}));

// Mock SecurityService
jest.mock('../securityService', () => ({
  SecurityService: {
    getInstance: jest.fn(() => ({
      getSecuritySettings: jest.fn().mockResolvedValue({
        twoFactor: {
          required: true,
          method: 'authenticator',
          expiry: 24
        },
        dataRetention: {
          messageRetention: 30,
          fileRetention: 90,
          auditLogs: 365
        }
      }),
      logAuditEvent: jest.fn()
    }))
  }
}));

// Mock console.error to prevent noise in test output
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (args[0]?.includes?.('Error')) {
    return;
  }
  originalConsoleError(...args);
};

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

describe('Setup', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
}); 