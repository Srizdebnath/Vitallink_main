// File: src/app/medical/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

// --- TYPE DEFINITIONS ---
type DecodedToken = {
  role: 'DONOR' | 'MEDICAL_PROFESSIONAL' | 'ADMIN';
};

type PendingDonor = {
  id: string;
  fullName: string | null;
  email: string;
  donorProfile: {
    bloodType: string | null;
    status: string;
  } | null;
};

type Patient = {
  id: string;
  fullName: string;
  bloodType: string;
  organNeeded: string;
  medicalUrgency: number;
};

type Match = {
  id: string;
  bloodType: string | null;
  organsToDonate: string | null;
  user: {
    fullName: string | null;
    email: string;
  };
};

// --- MODAL COMPONENT ---
function MatchModal({ patient, matches, onClose }: { patient: Patient | null; matches: Match[]; onClose: () => void; }) {
  if (!patient) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-2">Potential Matches for {patient.fullName}</h3>
        <p className="text-sm text-gray-600 mb-4">Needed: <span className="font-semibold">{patient.organNeeded}</span> (Patient Blood Type: <span className="font-semibold">{patient.bloodType}</span>)</p>
        <div className="max-h-80 overflow-y-auto">
          {matches.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Donor Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Blood Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matches.map(match => (
                  <tr key={match.id}>
                    <td className="px-4 py-3 text-sm">{match.user.fullName}</td>
                    <td className="px-4 py-3 text-sm">{match.user.email}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{match.bloodType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-8">No compatible donors found in the registry at this time.</p>
          )}
        </div>
        <button onClick={onClose} className="mt-6 w-full rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function MedicalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDonors, setPendingDonors] = useState<PendingDonor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // State for the matching modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.role !== 'MEDICAL_PROFESSIONAL' && decodedToken.role !== 'ADMIN') {
          throw new Error('Access Denied: You do not have permission to view this page.');
        }

        // Fetch both donors and patients at the same time for efficiency
        const [donorsRes, patientsRes] = await Promise.all([
          fetch('/api/donors', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/patients', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!donorsRes.ok) throw new Error('Failed to fetch pending donors');
        if (!patientsRes.ok) throw new Error('Failed to fetch patients');

        const donorsData = await donorsRes.json();
        const patientsData = await patientsRes.json();

        setPendingDonors(donorsData.pendingDonors);
        setPatients(patientsData.patients);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleApprove = (donorId: string) => {
    const token = localStorage.getItem('token');
    const approvePromise = fetch(`/api/donors/${donorId}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
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
        setPendingDonors(currentDonors => currentDonors.filter(donor => donor.id !== donorId));
        return data.message || 'Donor approved successfully!';
      },
      error: (err) => err.message,
    });
  };

  const handleFindMatch = (patient: Patient) => {
    const token = localStorage.getItem('token');
    setSelectedPatient(patient);

    const matchPromise = fetch(`/api/match/${patient.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(async res => {
      if (!res.ok) throw new Error('Failed to fetch matches.');
      return res.json();
    });

    toast.promise(matchPromise, {
      loading: `Searching for matches for ${patient.fullName}...`,
      success: (data) => {
        setMatches(data.matches);
        setIsModalOpen(true); // Open the modal on success
        return "Search complete.";
      },
      error: (err) => err.message
    });
  };

  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading portal data...</div>;
  if (error) return <div className="flex min-h-screen items-center justify-center text-red-500 font-bold">{error}</div>;

  return (
    <>
      {isModalOpen && <MatchModal patient={selectedPatient} matches={matches} onClose={() => setIsModalOpen(false)} />}
      <div className="bg-gray-50 flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Medical Portal</h1>
            <Link href="/medical/add-patient" className="rounded-md bg-theme-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-theme-600">
              + Add New Patient
            </Link>
          </div>

          {/* Registered Patients Section */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Registered Patients</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organ Needed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.length > 0 ? patients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 text-sm font-medium">{patient.fullName}</td>
                      <td className="px-6 py-4 text-sm">{patient.organNeeded}</td>
                      <td className="px-6 py-4 text-sm">{patient.bloodType}</td>
                      <td className="px-6 py-4 text-sm">{patient.medicalUrgency}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button onClick={() => handleFindMatch(patient)} className="text-theme-600 hover:text-theme-900 font-semibold">Find Match</button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={5} className="py-4 text-center text-gray-500">No patients registered for this hospital.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pending Approvals Section */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Pending Donor Approvals</h2>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{donor.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{donor.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {donor.donorProfile?.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleApprove(donor.id)} className="text-theme-600 hover:text-theme-900 font-semibold">Approve</button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No pending donor verifications.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}