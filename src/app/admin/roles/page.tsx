'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRole, updateUserRole, canManageRoles } from '@/lib/services/roleService';
import { UserRole } from '@/types/user';

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  currentRole: UserRole;
}

export default function RoleManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !canManageRoles(user.role)) {
      setError('Unauthorized access');
      return;
    }

    // TODO: Implement fetching all users
    // This is a placeholder - you'll need to implement the actual user fetching logic
    const fetchUsers = async () => {
      try {
        // Mock data for now
        const mockUsers: UserWithRole[] = [
          {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            currentRole: 'admin'
          },
          {
            id: '2',
            email: 'coach@example.com',
            name: 'Coach User',
            currentRole: 'coach'
          },
          {
            id: '3',
            email: 'client@example.com',
            name: 'Client User',
            currentRole: 'client'
          }
        ];
        setUsers(mockUsers);
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const success = await updateUserRole(userId, newRole);
      if (success) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, currentRole: newRole } : u
        ));
      } else {
        setError('Failed to update role');
      }
    } catch (err) {
      setError('Error updating role');
      console.error(err);
    }
  };

  if (!user || !canManageRoles(user.role)) {
    return <div>Unauthorized access</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Role Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Current Role
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {user.currentRole}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    value={user.currentRole}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="admin">Admin</option>
                    <option value="coach">Coach</option>
                    <option value="client">Client</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 