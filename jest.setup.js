// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
  }),
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

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  })),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn(); // Return unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_FIREBASE_API_KEY: 'mock-api-key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'mock-auth-domain',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'mock-project-id',
}; 