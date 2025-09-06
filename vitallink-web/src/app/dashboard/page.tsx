'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';


type DonorProfile = {
  bloodType: string;
  address: string;
  organsToDonate: string[];
  donationType: 'ALIVE' | 'AFTER_DEATH';
};

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [bloodType, setBloodType] = useState('');
  const [address, setAddress] = useState('');
  const [organs, setOrgans] = useState('');
  const [donationType, setDonationType] = useState<'ALIVE' | 'AFTER_DEATH'>('AFTER_DEATH');

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
          setDonationType(data.profile.donationType || 'AFTER_DEATH');
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

  const handleProfileUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const organsArray = organs.split(',').map(organ => organ.trim()).filter(Boolean);

    const body = { bloodType, address, organsToDonate: organsArray, donationType };

    const updatePromise = fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ bloodType, address, organsToDonate: organsArray }),
    }).then(async (response) => {
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }
      return response.json();
    });

    toast.promise(updatePromise, {
      loading: 'Saving changes...',
      success: (data) => {
        setProfile(data.profile);
        return 'Profile updated successfully!';
      },
      error: (err) => err.toString(),
    });
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 flex-grow">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl text-black font-bold">Your Donor Dashboard</h1>
        <Link
          href="/dashboard/card"
          className="inline-block mt-4 rounded-md bg-theme-500 px-4 py-2 text-sm font-medium text-black border border-theme-500 shadow-sm hover:bg-theme-600 transition"
        >
          View Digital ID Card
        </Link>
        <p className="mt-2 text-gray-600">Manage your donation preferences and personal information below.</p>

        <div className="mt-8 max-w-2xl">
          <form onSubmit={handleProfileUpdate} className="space-y-6 rounded-lg bg-white text-black p-8 shadow-md">
            <h2 className="text-xl font-semibold">Update Your Profile</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Donation Preference</label>
              <fieldset className="mt-2">
                <legend className="sr-only">Donation Type</legend>
                <div className="space-y-2 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                  <div className="flex items-center">
                    <input id="after_death" name="donation-type" type="radio" value="AFTER_DEATH"
                      checked={donationType === 'AFTER_DEATH'} onChange={(e) => setDonationType(e.target.value as any)}
                      className="h-4 w-4 border-gray-300 text-theme-600 focus:ring-theme-500"
                    />
                    <label htmlFor="after_death" className="ml-3 block text-sm font-medium text-gray-700">Pledge for donation after death</label>
                  </div>
                  <div className="flex items-center">
                    <input id="alive" name="donation-type" type="radio" value="ALIVE"
                      checked={donationType === 'ALIVE'} onChange={(e) => setDonationType(e.target.value as any)}
                      className="h-4 w-4 border-gray-300 text-theme-600 focus:ring-theme-500"
                    />
                    <label htmlFor="alive" className="ml-3 block text-sm font-medium text-gray-700">Register as a living donor</label>
                  </div>
                </div>
              </fieldset>
            </div>
            <div>
              <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">Blood Type</label>
              <input type="text" id="bloodType" value={bloodType} onChange={(e) => setBloodType(e.target.value)}
                className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-sm"
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
                className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-sm"
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