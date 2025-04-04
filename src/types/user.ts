export type UserRole = 'admin' | 'coach' | 'client';

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser extends BaseUser {
  role: 'admin';
}

export interface CoachUser extends BaseUser {
  role: 'coach';
  specialties: string[];
  experience: string;
  bio?: string;
  clients?: string[]; // Array of client IDs
}

export interface ClientUser extends BaseUser {
  role: 'client';
  coachId?: string;
  goals: string[];
  checkinFrequency: 'weekly' | 'bi-weekly' | 'monthly';
  lastCheckIn?: Date;
}

export type User = AdminUser | CoachUser | ClientUser;

// Helper functions for role checking
export const isAdmin = (user: User): user is AdminUser => user.role === 'admin';
export const isCoach = (user: User): user is CoachUser => user.role === 'coach';
export const isClient = (user: User): user is ClientUser => user.role === 'client'; 