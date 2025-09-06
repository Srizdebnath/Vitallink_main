'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react'; 
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  role: 'DONOR' | 'MEDICAL_PROFESSIONAL' | 'ADMIN';
};

export default function Navbar() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setUserRole(null);
    router.push('/');
  }, [router]); 

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
  }, [handleLogout]); 

  //  Helper for active/hover effect
  const linkClasses = (path: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      pathname === path
        ? "bg-gray-100 text-gray-900" // active (permanent hover look)
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (

    <nav className="bg-white shadow-sm" >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo */}
          <div className="flex">
            <Link href="/" className="flex flex-shrink-0 items-center text-2xl font-bold text-black">
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  className="ml-2 size-10 text-theme-600"
                  fill="currentColor"
                >
                  <path d="M320 171.9L305 151.1C280 116.5 239.9 96 197.1 96C123.6 96 64 155.6 64 229.1L64 231.7C64 255.3 70.2 279.7 80.6 304L186.6 304C189.8 304 192.7 302.1 194 299.1L225.8 222.8C229.5 214 238.1 208.2 247.6 208C257.1 207.8 265.9 213.4 269.8 222.1L321.1 336L362.5 253.2C366.6 245.1 374.9 239.9 384 239.9C393.1 239.9 401.4 245 405.5 253.2L428.7 299.5C430.1 302.2 432.8 303.9 435.9 303.9L559.5 303.9C570 279.6 576.1 255.2 576.1 231.6L576.1 229C576 155.6 516.4 96 442.9 96C400.2 96 360 116.5 335 151.1L320 171.8zM533.6 352L435.8 352C414.6 352 395.2 340 385.7 321L384 317.6L341.5 402.7C337.4 411 328.8 416.2 319.5 416C310.2 415.8 301.9 410.3 298.1 401.9L248.8 292.4L238.3 317.6C229.6 338.5 209.2 352.1 186.6 352.1L106.4 352.1C153.6 425.9 229.4 493.8 276.8 530C289.2 539.4 304.4 544.1 319.9 544.1C335.4 544.1 350.7 539.5 363 530C410.6 493.7 486.4 425.8 533.6 352z"/>
                </svg>
                VitalLink
              </span>
            </Link>
          </div>

          {/* Nav links */}
          <div className="flex items-center">
            <div className="flex items-baseline space-x-4">
              <Link href="/ask" className={linkClasses("/ask")}>Ask AI</Link>

              {userRole ? (
                <>
                  {userRole === 'DONOR' && (
                    <Link href="/dashboard" className={linkClasses("/dashboard")}>Dashboard</Link>
                  )}
                  {userRole === 'MEDICAL_PROFESSIONAL' && (
                    <Link href="/medical" className={linkClasses("/medical")}>Medical Portal</Link>
                  )}
                  {userRole === 'ADMIN' && (
                    <Link href="/admin" className={linkClasses("/admin")}>Admin</Link>
                  )}
                  <Link href="/ledger" className={linkClasses("/ledger")}>Ledger</Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={linkClasses("/login")}>Login</Link>
                  <Link href="/register" className={linkClasses("/register")}>Donor Register</Link>
                  <Link href="/register-medical" className={linkClasses("/register-medical")}>Medical Professional Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
