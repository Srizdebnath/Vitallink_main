// File: src/app/login/page.tsx

'use client';
import { useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // <-- 1. IMPORT the decoder

// 2. DEFINE a type for our token's payload for better code quality
interface DecodedToken {
  userId: string;
  email: string;
  role: 'DONOR' | 'MEDICAL_PROFESSIONAL' | 'ADMIN';
  iat: number;
  exp: number;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If login fails (e.g., wrong password), throw an error to be caught below
        throw new Error(data.message || 'Login failed.');
      }
      
      // If login is successful:
      const { token } = data;
      localStorage.setItem('token', token);
      alert('Login successful!');

      // --- 3. IMPLEMENT THE REDIRECT LOGIC ---
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const userRole = decodedToken.role;

        // Redirect based on the user's role
        switch (userRole) {
          case 'DONOR':
            window.location.href = '/dashboard';
            break;
          case 'MEDICAL_PROFESSIONAL':
            window.location.href = '/medical';
            break;
          case 'ADMIN':
            window.location.href = '/admin'; // For future implementation
            break;
          default:
            // Fallback to the homepage if role is unknown
            window.location.href = '/';
            break;
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        // If token is malformed, just go to a default page
        window.location.href = '/dashboard';
      }

    } catch (error) {
      // This will catch errors from the fetch call (e.g., network error)
      // or the error we threw for a failed login.
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unknown error occurred.');
      }
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* ... The rest of the form JSX is unchanged ... */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
            <div className="mt-2">
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-theme-500 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
            </div>
            <div className="mt-2">
              <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-theme-500 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <button type="submit"
              className="flex w-full justify-center text-black rounded-md bg-theme-500 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm hover:bg-theme-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-500"
            >
              Sign in
            </button>
          </div>
        </form>
        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{' '}
          <a href="/register" className="font-semibold leading-6 text-theme-600 hover:text-theme-500">Sign up now</a>
        </p>
      </div>
    </div>
  );
}