import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types/user';
import { hasAnyRole } from '@/lib/utils/roleUtils';

interface WithRoleProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function WithRoleWrapper(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return;

      if (!session?.user) {
        router.push('/login');
        return;
      }

      const userRole = session.user.role as UserRole;
      if (!hasAnyRole({ role: userRole } as any, allowedRoles)) {
        router.push('/unauthorized');
      }
    }, [session, status, router]);

    if (status === 'loading') {
      return <div>Loading...</div>;
    }

    if (!session?.user) {
      return null;
    }

    const userRole = session.user.role as UserRole;
    if (!hasAnyRole({ role: userRole } as any, allowedRoles)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 