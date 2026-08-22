import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../api/axios';
import { Users, Shield, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/auth/users/');
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (id: number, newRole: string) => {
    setUpdatingId(id);
    try {
      await axiosInstance.put(`/auth/users/${id}/role/`, { role: newRole });
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'ADMIN': return <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-max"><ShieldAlert size={12}/> Admin</span>;
      case 'MANAGER': return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-max"><Shield size={12}/> Manager</span>;
      case 'STAFF': return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-max"><UserCheck size={12}/> Staff</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-full w-max">Customer</span>;
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                      {u.first_name?.[0] || 'U'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{u.first_name} {u.last_name}</div>
                      <div className="text-sm text-gray-500">Joined: {new Date(u.date_joined).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{u.email}</div>
                  <div className="text-sm text-gray-500">{u.phone_number || 'No phone'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(u.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <select
                    disabled={updatingId === u.id || user?.role !== 'ADMIN'}
                    value={u.role}
                    onChange={(e) => updateUserRole(u.id, e.target.value)}
                    className="ml-auto block w-32 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="STAFF">Staff</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
