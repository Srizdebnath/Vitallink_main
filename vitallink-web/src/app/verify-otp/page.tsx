'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      toast.error("Email is missing. Please register again.");
      return;
    }
    
    const verifyPromise = fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed.');
      return data;
    });

    toast.promise(verifyPromise, {
      loading: 'Verifying code...',
      success: (data) => {
        localStorage.setItem('token', data.token);
        router.push('/dashboard'); 
        return 'Account verified successfully!';
      },
      error: (err) => err.message,
    });
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-black text-2xl font-bold">Verify Your Email</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a 6-digit code to <strong>{email}</strong>. Please enter it below.
        </p>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="block text-black text-sm font-medium">Verification Code (OTP)</label>
            <div className="mt-2">
              <input id="otp" name="otp" type="text" maxLength={6} required value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full text-black rounded-md border-0 py-1.5 text-center text-2xl tracking-[1em] shadow-sm focus:ring-2 focus:ring-theme-500"
              />
            </div>
          </div>
          <div>
            <button type="submit" className="flex w-full text-black justify-center rounded-md bg-theme-500 px-3 py-1.5 text-sm font-semibold shadow-sm hover:bg-theme-600">
              Verify Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}