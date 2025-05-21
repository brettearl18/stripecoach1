// Mock implementation of Firebase client for testing
const mockStorage = {
  removeItem: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};

// Mock the Firebase Auth persistence
const mockPersistence = {
  type: 'LOCAL',
  storage: mockStorage,
  _shouldAllowMigration: true
};

// Mock the Firebase Auth
const mockAuth = {
  setPersistence: jest.fn().mockResolvedValue(undefined),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  currentUser: null
};

// Mock the Firebase app
const mockApp = {
  auth: () => mockAuth,
  storage: () => mockStorage
};

// Mock initialization function
export const initializeApp = jest.fn().mockReturnValue(mockApp);

// Export mock instances for direct usage in tests
export const auth = mockAuth;
export const storage = mockStorage;
export const persistence = mockPersistence; 