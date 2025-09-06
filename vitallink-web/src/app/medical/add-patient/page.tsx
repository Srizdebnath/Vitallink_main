// File: src/app/medical/add-patient/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AddPatientPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [organNeeded, setOrganNeeded] = useState('');
  const [medicalUrgency, setMedicalUrgency] = useState('50'); // Default to 50

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');

    const addPromise = fetch('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName, bloodType, organNeeded, medicalUrgency }),
    }).then(async (response) => {
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add patient.');
      }
      return response.json();
    });

    toast.promise(addPromise, {
      loading: 'Adding patient to the registry...',
      success: (data) => {
        // Redirect back to the main medical dashboard on success
        router.push('/medical');
        return data.message || 'Patient added successfully!';
      },
      error: (err) => err.message,
    });
  };

  return (
    <div className="bg-gray-50 flex-grow py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl text-black font-bold">Add New Patient (Recipient)</h1>
        <p className="mt-2 text-gray-600">Enter the details for a patient in need of an organ transplant.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-lg bg-white p-8 shadow-md">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required
              className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">Blood Type</label>
            <input type="text" id="bloodType" value={bloodType} onChange={(e) => setBloodType(e.target.value)} required
              className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-sm"
              placeholder="e.g., B-"
            />
          </div>
          <div>
            <label htmlFor="organNeeded" className="block text-sm font-medium text-gray-700">Organ Needed</label>
            <input type="text" id="organNeeded" value={organNeeded} onChange={(e) => setOrganNeeded(e.target.value)} required
              className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-sm"
              placeholder="e.g., Kidney"
            />
          </div>
          <div>
            <label htmlFor="medicalUrgency" className="block text-sm font-medium text-gray-700">Medical Urgency (1-100)</label>
            <input type="range" id="medicalUrgency" min="1" max="100" value={medicalUrgency} onChange={(e) => setMedicalUrgency(e.target.value)}
              className="mt-1 w-full h-2 text-black bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center text-black font-semibold text-theme-600">{medicalUrgency}</div>
          </div>
          <div>
            <button type="submit"
              className="w-full rounded-md text-black bg-theme-500 px-4 py-2 text-sm font-medium shadow-sm hover:bg-theme-600 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:ring-offset-2"
            >
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}