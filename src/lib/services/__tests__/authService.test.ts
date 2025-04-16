import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { authService } from '../authService';
import { db } from '../../firebase/config';

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('../../firebase/config', () => ({
  db: {},
}));

describe('authService', () => {
  const mockUserId = 'test-user-id';
  const mockUserData = {
    email: 'test@example.com',
    role: 'coach',
    lastLogin: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      const mockDocRef = { id: mockUserId };
      const mockDocSnap = {
        exists: () => true,
        data: () => mockUserData,
      };

      (doc as jest.Mock).mockReturnValue(mockDocRef);
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await authService.authenticateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: mockUserId,
        ...mockUserData,
      });
      expect(doc).toHaveBeenCalledWith(db, 'users', 'test@example.com');
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should return null for non-existent user', async () => {
      const mockDocRef = { id: mockUserId };
      const mockDocSnap = {
        exists: () => false,
        data: () => null,
      };

      (doc as jest.Mock).mockReturnValue(mockDocRef);
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await authService.authenticateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
      expect(doc).toHaveBeenCalledWith(db, 'users', 'nonexistent@example.com');
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should handle Firestore errors', async () => {
      const mockDocRef = { id: mockUserId };
      (doc as jest.Mock).mockReturnValue(mockDocRef);
      (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const result = await authService.authenticateUser('test@example.com', 'password123');

      expect(result).toBeNull();
      expect(doc).toHaveBeenCalledWith(db, 'users', 'test@example.com');
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    });
  });

  describe('updateLastLogin', () => {
    const mockRole = 'coach';

    it('should update last login timestamp', async () => {
      const mockDocRef = { id: mockUserId };
      (doc as jest.Mock).mockReturnValue(mockDocRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await authService.updateLastLogin(mockUserId, mockRole);

      expect(doc).toHaveBeenCalledWith(db, 'users', mockUserId);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        lastLogin: expect.any(Date),
        role: mockRole,
      });
    });

    it('should throw error on update failure', async () => {
      const mockDocRef = { id: mockUserId };
      const mockError = new Error('Update failed');
      
      (doc as jest.Mock).mockReturnValue(mockDocRef);
      (updateDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(authService.updateLastLogin(mockUserId, mockRole))
        .rejects
        .toThrow(mockError);

      expect(doc).toHaveBeenCalledWith(db, 'users', mockUserId);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        lastLogin: expect.any(Date),
        role: mockRole,
      });
    });
  });
});