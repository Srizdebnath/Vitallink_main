// File: src/app/medical/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // We need a library to decode the token

// Define types for our data
type DecodedToken = {
  userId: string;
  email: string;
  role: 'DONOR' | 'MEDICAL_PROFESSIONAL' | 'ADMIN';
  iat: number;
  exp: number;
};

type Donor = {
  id: string;
  fullName: string | null;
  email: string;
  donorProfile: {
    bloodType: string | null;
  } | null;
};

export default function MedicalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      
      // ** THE SECURITY CHECK **
      if (decodedToken.role !== 'MEDICAL_PROFESSIONAL') {
        setError('Access Denied: You do not have permission to view this page.');
        setIsLoading(false);
        return;
      }

      // If authorized, fetch the donor list (we'll create this API next)
      const fetchDonors = async () => {
        const res = await fetch('/api/donors', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch donors');
        const data = await res.json();
        setDonors(data.donors);
      };

      fetchDonors();
    } catch (err) {
      setError('An error occurred while verifying your permissions.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading and verifying access...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Registered Donor List</h1>
      <p className="mt-2 text-gray-600">This is a secure list for authorized medical personnel only.</p>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Full Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Blood Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donors.map((donor) => (
                  <tr key={donor.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{donor.fullName}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{donor.email}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{donor.donorProfile?.bloodType || 'N/A'}</td>
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