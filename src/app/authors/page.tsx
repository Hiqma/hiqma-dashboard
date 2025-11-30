'use client';

import { AuthorsManagement } from '@/components/AuthorsManagement';

export default function AuthorsPage() {
  return (
    <div className="pt-2 bg-[#f5f5f7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">
            Authors
          </h1>
          <p className="text-gray-600 mt-1">
            Manage content authors and their profiles.
          </p>
        </div>
        <AuthorsManagement />
      </div>
    </div>
  );
}