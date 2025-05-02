// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve(null)),
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock Firebase
jest.mock('@/lib/firebase/firebase-client', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
}));

// Mock programTemplateService
jest.mock('@/lib/services/programTemplateService', () => ({
  programTemplateService: {
    listTemplates: jest.fn(),
    createTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn(),
  },
}));

// Mock browser APIs
global.Request = class {
  constructor(url, options) {
    this.url = url;
    this.options = options;
  }
};

global.Response = class {
  constructor(body, init) {
    this._body = body;
    this._init = init || {};
    this.headers = new Headers(this._init.headers);
    this.status = this._init.status || 200;
    this.ok = this.status >= 200 && this.status < 300;
  }

  json() {
    return Promise.resolve(
      typeof this._body === 'string' ? JSON.parse(this._body) : this._body
    );
  }

  text() {
    return Promise.resolve(
      typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
    );
  }
};

global.Headers = class {
  constructor(init) {
    this._headers = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this._headers.set(key.toLowerCase(), value);
      });
    }
  }

  get(name) {
    return this._headers.get(name.toLowerCase()) || null;
  }

  set(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }
};

// Mock browser storage
Object.defineProperty(window, 'localStorage', {
  value: new Map()
});

Object.defineProperty(window, 'sessionStorage', {
  value: new Map()
});

// Mock the entire @firebase/auth package
jest.mock('@firebase/auth', () => {
  const mockStorage = new Map();
  
  return {
    browserLocalPersistence: {
      type: 'LOCAL',
      storage: mockStorage,
      _isAvailable: () => Promise.resolve(true),
      _get: (key) => Promise.resolve(mockStorage.get(key)),
      _set: (key, value) => {
        mockStorage.set(key, value);
        return Promise.resolve();
      },
      _remove: (key) => {
        mockStorage.delete(key);
        return Promise.resolve();
      }
    },
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    getAuth: jest.fn(() => ({
      currentUser: null,
      onAuthStateChanged: jest.fn(),
      signOut: jest.fn()
    }))
  };
});

// Mock Firebase Auth
jest.mock('firebase/auth', () => {
  const mockStorage = new Map();
  
  return {
    browserLocalPersistence: {
      type: 'LOCAL',
      storage: mockStorage,
      _isAvailable: () => Promise.resolve(true),
      _get: (key) => Promise.resolve(mockStorage.get(key)),
      _set: (key, value) => {
        mockStorage.set(key, value);
        return Promise.resolve();
      },
      _remove: (key) => {
        mockStorage.delete(key);
        return Promise.resolve();
      }
    },
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    getAuth: jest.fn(() => ({
      currentUser: null,
      onAuthStateChanged: jest.fn(),
      signOut: jest.fn()
    }))
  };
});

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_FIREBASE_API_KEY: 'mock-api-key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'mock-auth-domain',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'mock-project-id',
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 