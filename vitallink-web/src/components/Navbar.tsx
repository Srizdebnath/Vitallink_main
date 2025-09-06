// File: src/components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  role: 'DONOR' | 'MEDICAL_PROFESSIONAL' | 'ADMIN';
};

export default function Navbar() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  // Wrap handleLogout in useCallback so it doesn't change on every render
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setUserRole(null);
    router.push('/');
  }, [router]); // It only depends on the router

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    } else {
      setUserRole(null);
    }
  }, [handleLogout]); // Add handleLogout to the dependency array

  // ... The rest of the JSX is unchanged
  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/" className="flex flex-shrink-0 items-center text-black text-2xl font-bold text-black text-theme-600">
              VitalLink
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex items-baseline space-x-4">
              <Link href="/ask" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Ask AI</Link>
              
              {userRole ? (
                <>
                  {userRole === 'DONOR' && <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Dashboard</Link>}
                  {userRole === 'MEDICAL_PROFESSIONAL' && <Link href="/medical" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Medical Portal</Link>}
                  {userRole === 'ADMIN' && <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Admin</Link>}
                  <Link href="/ledger" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Ledger</Link>
                  <button onClick={handleLogout} className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Login</Link>
                  <Link href="/register" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}