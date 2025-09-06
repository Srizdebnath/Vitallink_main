// File: src/app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DonorProfile = {
  bloodType: string;
  address: string;
  organsToDonate: string[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [bloodType, setBloodType] = useState('');
  const [address, setAddress] = useState('');
  const [organs, setOrgans] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
          setBloodType(data.profile.bloodType || '');
          setAddress(data.profile.address || '');
          setOrgans(data.profile.organsToDonate.join(', '));
        }
      } catch (error) {
        console.error(error);
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const organsArray = organs.split(',').map(organ => organ.trim()).filter(Boolean);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bloodType, address, organsToDonate: organsArray }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');
      alert('Profile updated successfully!');
      setProfile(data.profile);
    } catch (error) {
      console.error(error);
      alert('Error updating profile.');
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 flex-grow">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-black">Your Donor Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your donation preferences and personal information below.</p>

        <div className="mt-8 max-w-2xl">
          <form onSubmit={handleProfileUpdate} className="space-y-6 rounded-lg bg-white p-8 shadow-md">
            <h2 className="text-xl font-semibold text-black">Update Your Profile</h2>
            <div>
              <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">Blood Type</label>
              <input type="text" id="bloodType" value={bloodType} onChange={(e) => setBloodType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-sm"
                placeholder="e.g., A+"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-sm"
                placeholder="123 Main St, Anytown, USA"
              />
            </div>
            <div>
              <label htmlFor="organs" className="block text-sm font-medium text-gray-700">Organs to Donate</label>
              <p className="text-xs text-gray-500">Separate with commas (e.g., Heart, Lungs, Kidneys)</p>
              <input type="text" id="organs" value={organs} onChange={(e) => setOrgans(e.target.value)}
                className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-sm"
              />
            </div>
            <div>
              <button type="submit"
                className="w-full rounded-md bg-theme-500 px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-theme-600 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}