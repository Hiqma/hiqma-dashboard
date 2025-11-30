'use client';

import { ContributorApplications } from '@/components/ContributorApplications';

export default function ContributorsPage() {
  return (
    <div className="pt-2 bg-[#f5f5f7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">
            Contributors
          </h1>
          <p className="text-gray-600 mt-1">
            Manage contributor applications and permissions.
          </p>
        </div>
        <ContributorApplications />
      </div>
    </div>
  );
}