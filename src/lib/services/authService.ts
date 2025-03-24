import { prisma } from '@/lib/prisma';

export async function updateLastLogin(userId: string, userType: 'coach' | 'client') {
  try {
    if (userType === 'coach') {
      await prisma.coach.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() }
      });
    } else {
      await prisma.client.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() }
      });
    }
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

// ... existing auth service code ... 