'use client';

import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          There was an error during the authentication process. Please try again.
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
