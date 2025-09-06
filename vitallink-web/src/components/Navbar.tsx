'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <span className="flex items-center text-2xl font-bold text-black tracking-tight group-hover:text-gray-800 transition-colors">
              <svg
                className="h-8 w-8 mr-2 text-theme-500 group-hover:text-theme-600 transition-colors"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="16" fill="currentColor" opacity="0.15" />
                <path
                  d="M16 7c2.5 0 4.5 2 4.5 4.5 0 2.2-1.7 4.2-4.5 7.2-2.8-3-4.5-5-4.5-7.2C11.5 9 13.5 7 16 7zm0 13.5c4.5-4.7 7-7.6 7-10C23 7.6 19.9 5 16 5s-7 2.6-7 5.5c0 2.4 2.5 5.3 7 10zm0 2.5a2 2 0 100 4 2 2 0 000-4z"
                  fill="currentColor"
                />
              </svg>
              VitalLink
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link
              href="/"
              className="hidden md:inline-block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-theme-50 hover:text-theme-600 transition"
            >
              Home
            </Link>
            <Link
              href="/ask"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Ask AI
            </Link>
            <Link
              href="/faq"
              className="hidden md:inline-block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-theme-50 hover:text-theme-600 transition"
            >
              FAQ
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-semibold text-black text-theme-600 hover:bg-theme-100 hover:text-theme-700 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-theme-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-theme-50 hover:text-theme-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 rounded-md text-sm font-semibold bg-theme-500 text-black shadow hover:bg-theme-600 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}