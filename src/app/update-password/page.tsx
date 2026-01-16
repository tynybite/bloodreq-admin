'use client';

import Link from 'next/link';

export default function UpdatePasswordPage() {
  // With Firebase, password updates are handled via email links
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Update Password</h1>
        <p className="text-gray-600 mb-6">
          Password updates are handled via the link sent to your email.
        </p>
        <Link 
          href="/admin" 
          className="inline-block bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
        >
          Go to Admin
        </Link>
      </div>
    </div>
  );
}
