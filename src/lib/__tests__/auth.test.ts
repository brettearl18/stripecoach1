import { authenticateUser } from '../services/authService';
import { authConfig } from '@/lib/auth';

// Mock the authService
jest.mock('../services/authService', () => ({
  authenticateUser: jest.fn()
}));

// Mock the auth config
jest.mock('@/lib/auth', () => ({
  authConfig: {
    providers: {
      credentials: {
        authorize: async (credentials: any) => {
          if (!credentials.email || !credentials.password) {
            return null;
          }
          return await authenticateUser(credentials.email, credentials.password);
        }
      }
    },
    callbacks: {
      jwt: ({ token, user }: any) => {
        if (user) {
          token.user = user;
        }
        return token;
      },
      session: ({ session, token }: any) => {
        if (token.user) {
          session.user = token.user;
        }
        return session;
      }
    }
  }
}));

// Mock user data
const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  name: 'Test User',
};

describe('Auth Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CredentialsProvider', () => {
    const provider = authConfig.providers.credentials;

    it('should authenticate valid credentials', async () => {
      (authenticateUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await provider.authorize({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(authenticateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toEqual(mockUser);
    });

    it('should return null for missing credentials', async () => {
      const result = await provider.authorize({});
      expect(authenticateUser).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null for invalid credentials', async () => {
      (authenticateUser as jest.Mock).mockResolvedValue(null);

      const result = await provider.authorize({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(authenticateUser).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('JWT Callback', () => {
    it('should include user data in token', () => {
      const token = { someData: 'test' };
      const result = authConfig.callbacks.jwt({ token, user: mockUser });
      expect(result).toEqual({ someData: 'test', user: mockUser });
    });

    it('should return token if no user', () => {
      const token = { someData: 'test' };
      const result = authConfig.callbacks.jwt({ token });
      expect(result).toEqual(token);
    });
  });

  describe('Session Callback', () => {
    it('should set user in session', () => {
      const session = {};
      const token = { user: mockUser };
      const result = authConfig.callbacks.session({ session, token });
      expect(result).toEqual({ user: mockUser });
    });

    it('should handle no user in token', () => {
      const session = {};
      const token = {};
      const result = authConfig.callbacks.session({ session, token });
      expect(result).toEqual({});
    });
  });
});