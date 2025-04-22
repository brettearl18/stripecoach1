import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { auth } from '@/lib/firebase/auth';
import { getUserRole } from '@/lib/services/roleService';

// Mock the modules
jest.mock('@/lib/firebase/auth', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn()
  }
}));

jest.mock('@/lib/services/roleService', () => ({
  getUserRole: jest.fn()
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state and no user', () => {
    const unsubscribe = jest.fn();
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(null);
      return unsubscribe;
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it('should update state when user logs in', async () => {
    const unsubscribe = jest.fn();
    const mockUser = { uid: '123', email: 'test@example.com' };
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(mockUser);
      return unsubscribe;
    });
    (getUserRole as jest.Mock).mockResolvedValue('coach');

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.role).toBe('coach');
  });

  it('should handle error in getUserRole', async () => {
    const unsubscribe = jest.fn();
    const mockUser = { uid: '123', email: 'test@example.com' };
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(mockUser);
      return unsubscribe;
    });
    (getUserRole as jest.Mock).mockRejectedValue(new Error('Role fetch failed'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.role).toBeNull();
  });

  it('should handle sign out', async () => {
    const unsubscribe = jest.fn();
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(null);
      return unsubscribe;
    });
    (auth.signOut as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(auth.signOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });
}); 