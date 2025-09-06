'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';

type FullProfile = {
  fullName: string | null;
  donorProfile: {
    bloodType: string | null;
    donationType: string;
    status: string;
  } | null;
}

export default function CardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    const fetchFullProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }

      const res = await fetch('/api/profile/full', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        toast.error('Could not load profile data.');
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      setProfile(data.profile);
      setIsLoading(false);
    };
    fetchFullProfile();
  }, [router]);

  const handleDownload = () => {
    if (cardRef.current === null) {
      return;
    }
    toast.loading('Generating your ID card...');
    toPng(cardRef.current, { cacheBust: true, quality: 1.0 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'VitalLink-Donor-Card.png';
        link.href = dataUrl;
        link.click();
        toast.dismiss();
        toast.success('Card downloaded!');
      })
      .catch((err) => {
        console.error(err);
        toast.dismiss();
        toast.error('Could not generate card.');
      });
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading Your Donor Card...</div>;
  }
  
  return (
    <div className="bg-gray-100 flex-grow py-12 flex flex-col items-center justify-center">
      <div ref={cardRef} className="w-[350px] bg-white rounded-2xl shadow-lg p-6 font-sans">
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-xl font-bold text-black text-theme-600">VitalLink</h2>
          <span className="text-xs font-semibold text-red-500 uppercase">Organ Donor</span>
        </div>
        <div className="mt-6 text-center">
          <div className="w-24 h-24 rounded-full bg-theme-100 mx-auto flex items-center justify-center">
            <svg className="w-12 h-12 text-theme-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mt-4">{profile?.fullName}</h3>
          <p className="text-gray-500">Pledge: <span className="font-semibold">{profile?.donorProfile?.donationType.replace('_', ' ')}</span></p>
        </div>
        <div className="mt-6 pt-4 border-t flex justify-between text-center">
          <div>
            <p className="text-xs text-gray-500">Blood Type</p>
            <p className="font-bold text-lg text-gray-800">{profile?.donorProfile?.bloodType || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className={`font-bold text-lg ${profile?.donorProfile?.status === 'VERIFIED' ? 'text-green-600' : 'text-yellow-600'}`}>
              {profile?.donorProfile?.status.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
      <button onClick={handleDownload} className="mt-8 rounded-md bg-theme-500 px-6 py-3 text-lg font-semibold text-black shadow-sm hover:bg-theme-600">
        Download Card
      </button>
    </div>
  );
}