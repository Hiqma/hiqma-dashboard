'use client';

import { useEffect, useState } from 'react';
import { ContentReview } from '@/components/ContentReview';
import { ContributorContentManagement } from '@/components/ContributorContentManagement';

export default function ContentPage() {
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);
  }, []);

  const isContributor = userRole === 'contributor';

  return (
    <div className="pt-2 bg-[#f5f5f7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">
            {isContributor ? 'My Content' : 'Content Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isContributor 
              ? 'Manage your submitted content and add new submissions.' 
              : 'Review and manage educational content submissions.'}
          </p>
        </div>
        {isContributor ? <ContributorContentManagement /> : <ContentReview />}
      </div>
    </div>
  );
}