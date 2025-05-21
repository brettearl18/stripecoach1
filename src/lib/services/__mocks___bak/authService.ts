import { User } from '@/lib/types/user';

export const mockAuthService = {
  authenticateUser: jest.fn(),
  updateLastLogin: jest.fn(),
};

export default mockAuthService; 