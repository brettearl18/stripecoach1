import { User, UserRole, isAdmin, isCoach, isClient } from '@/types/user';

export const hasRole = (user: User, role: UserRole): boolean => {
  return user.role === role;
};

export const hasAnyRole = (user: User, roles: UserRole[]): boolean => {
  return roles.includes(user.role);
};

export const getRoleBasedRedirect = (user: User): string => {
  if (isAdmin(user)) return '/admin';
  if (isCoach(user)) return '/coach/dashboard';
  if (isClient(user)) return '/client/dashboard';
  return '/';
};

export const canAccessResource = (
  user: User,
  resourceOwnerId: string,
  allowedRoles: UserRole[] = []
): boolean => {
  // Admins can access everything
  if (isAdmin(user)) return true;

  // Check if user has any of the allowed roles
  if (allowedRoles.length > 0 && !hasAnyRole(user, allowedRoles)) {
    return false;
  }

  // Coaches can access their own resources and their clients' resources
  if (isCoach(user)) {
    return user.id === resourceOwnerId || user.clients?.includes(resourceOwnerId);
  }

  // Clients can only access their own resources
  if (isClient(user)) {
    return user.id === resourceOwnerId;
  }

  return false;
}; 