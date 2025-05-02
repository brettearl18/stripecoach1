import { AuthService } from '../authService';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    signOut: jest.fn()
  },
  db: {}
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn()
}));

describe('AuthService', () => {
  let authService: AuthService;
  const mockEmail = 'test@example.com';
  const mockUserId = 'test-user-id';
  const mockRole = 'coach';

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      const mockUser = {
        uid: mockUserId,
        email: mockEmail
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser
      });

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          role: mockRole,
          lastLogin: new Date()
        })
      });

      const result = await authService.authenticateUser(mockEmail, 'password123');

      expect(result).toEqual({
        id: mockUserId,
        email: mockEmail,
        role: mockRole,
        lastLogin: expect.any(Date)
      });
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, mockEmail, 'password123');
    });

    it('should throw error for invalid credentials', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error('Authentication failed'));

      await expect(authService.authenticateUser(mockEmail, 'wrong-password'))
        .rejects
        .toThrow('Authentication failed');
    });
  });

  describe('getUser', () => {
    it('should get user data', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          id: mockUserId,
          email: mockEmail,
          role: mockRole,
          lastLogin: new Date()
        })
      });

      const result = await authService.getUser(mockUserId);

      expect(result).toEqual({
        id: mockUserId,
        email: mockEmail,
        role: mockRole,
        lastLogin: expect.any(Date)
      });
      expect(doc).toHaveBeenCalledWith(db, 'users', mockUserId);
    });

    it('should return null for non-existent user', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false
      });

      const result = await authService.getUser(mockUserId);
      expect(result).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await authService.updateLastLogin(mockUserId);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {
          lastLogin: expect.any(Date)
        }
      );
    });

    it('should throw error if update fails', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(authService.updateLastLogin(mockUserId))
        .rejects
        .toThrow('Update failed');
    });
  });

  describe('signOut', () => {
    it('should sign out user', async () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      await authService.signOut();

      expect(signOut).toHaveBeenCalledWith(auth);
    });

    it('should throw error if sign out fails', async () => {
      (signOut as jest.Mock).mockRejectedValue(new Error('Sign out failed'));

      await expect(authService.signOut())
        .rejects
        .toThrow('Sign out failed');
    });
  });
});