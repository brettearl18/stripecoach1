// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-storage-bucket';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test-sender-id';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';
process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'test-measurement-id';

// Mock Redis environment variables
process.env.UPSTASH_REDIS_REST_URL = 'test-redis-url';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';

// Mock SendGrid environment variables
process.env.SENDGRID_API_KEY = 'SG.test-api-key';
process.env.SENDGRID_FROM_EMAIL = 'test@example.com';

// Mock other environment variables
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

describe('Environment', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
}); 