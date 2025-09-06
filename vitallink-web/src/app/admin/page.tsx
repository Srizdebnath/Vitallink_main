// File: src/app/admin/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

// Define types for our data
type DecodedToken = {
  role: 'DONOR' | 'MEDICAL_PROFESSIONAL' | 'ADMIN';
};

type User = {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      
      // ** CLIENT-SIDE SECURITY CHECK **
      if (decodedToken.role !== 'ADMIN') {
        setError('Access Denied: You must be an administrator to view this page.');
        setIsLoading(false);
        return;
      }

      const fetchUsers = async () => {
        const res = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch user data.');
        const data = await res.json();
        setUsers(data.users);
      };

      fetchUsers();
    } catch (err) {
      setError('An error occurred while verifying your permissions.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Verifying permissions...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="bg-gray-50 flex-grow py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl text-black font-bold">Administrator Dashboard</h1>
        <p className="mt-2 text-gray-600">User Management</p>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl text-black font-semibold mb-4">All Registered Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered On</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs text-black leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'MEDICAL_PROFESSIONAL' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}