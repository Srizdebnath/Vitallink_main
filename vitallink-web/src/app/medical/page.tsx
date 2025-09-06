// File: src/app/medical/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import Link from 'next/link';

type DecodedToken = {
  role: 'DONOR' | 'MEDICAL_PROFESSIONAL' | 'ADMIN';
};

// Updated Donor type to include status
type PendingDonor = {
  id: string;
  fullName: string | null;
  email: string;
  donorProfile: {
    bloodType: string | null;
    status: string;
  } | null;
};

export default function MedicalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDonors, setPendingDonors] = useState<PendingDonor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      if (decodedToken.role !== 'MEDICAL_PROFESSIONAL' && decodedToken.role !== 'ADMIN') {
        setError('Access Denied: You do not have permission to view this page.');
        setIsLoading(false);
        return;
      }

      const fetchDonors = async () => {
        const res = await fetch('/api/donors', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch pending donors');
        const data = await res.json();
        setPendingDonors(data.pendingDonors);
      };

      fetchDonors();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // NEW: Function to handle the approval action
  const handleApprove = (donorId: string) => {
    const token = localStorage.getItem('token');

    const approvePromise = fetch(`/api/donors/${donorId}/approve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Approval failed.');
      }
      return response.json();
    });

    toast.promise(approvePromise, {
      loading: 'Approving donor...',
      success: (data) => {
        // On success, remove the approved donor from the list in the UI
        setPendingDonors(currentDonors =>
          currentDonors.filter(donor => donor.id !== donorId)
        );
        return data.message || 'Donor approved successfully!';
      },
      error: (err) => err.message,
    });
  };

  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading pending approvals...</div>;
  if (error) return <div className="flex min-h-screen items-center justify-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="bg-gray-50 flex-grow py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Donor Verification Portal</h1>
          <Link href="/medical/add-patient" className="rounded-md bg-theme-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-theme-600">
            + Add New Patient
          </Link>
        </div>
        <p className="mt-2 text-gray-600">Review and approve new donor registrations.</p>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingDonors.length > 0 ? pendingDonors.map((donor) => (
                  <tr key={donor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{donor.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {donor.donorProfile?.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleApprove(donor.id)}
                        className="text-theme-600 hover:text-theme-900 font-semibold"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No pending donor verifications.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}