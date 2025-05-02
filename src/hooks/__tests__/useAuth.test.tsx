import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { auth } from '@/lib/firebase';
import { AuthService } from '@/lib/services/authService';

jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(() => () => {}),
    signOut: jest.fn()
  }
}));

jest.mock('@/lib/services/authService', () => {
  const mockAuthService = {
    getUser: jest.fn(),
    signOut: jest.fn(),
    updateLastLogin: jest.fn()
  };
  return {
    AuthService: jest.fn(() => mockAuthService)
  };
});

describe('useAuth Hook', () => {
  let mockAuthService: jest.Mocked<AuthService>;
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
  });

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should update user and role when auth state changes', async () => {
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });

    mockAuthService.getUser.mockResolvedValue({
      ...mockUser,
      role: 'coach'
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.role).toBe('coach');
    expect(result.current.loading).toBe(false);
  });

  it('should handle sign out', async () => {
    mockAuthService.signOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockAuthService.signOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it('should handle errors when getting user role', async () => {
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });

    mockAuthService.getUser.mockRejectedValue(new Error('Failed to get role'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.role).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should handle sign out errors', async () => {
    mockAuthService.signOut.mockRejectedValue(new Error('Sign out failed'));

    const { result } = renderHook(() => useAuth());

    let error;
    try {
      await act(async () => {
        await result.current.signOut();
      });
    } catch (e) {
      error = e;
    }

    expect(error).toEqual(new Error('Sign out failed'));
    expect(mockAuthService.signOut).toHaveBeenCalled();
  });

  it('should clean up auth state listener on unmount', () => {
    const unsubscribe = jest.fn();
    (auth.onAuthStateChanged as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
}); 