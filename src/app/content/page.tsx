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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isContributor ? 'My Content' : 'Content Management'}
        </h1>
        <p className="text-muted-foreground">
          {isContributor 
            ? 'Manage your submitted content and add new submissions.' 
            : 'Review and manage educational content submissions.'}
        </p>
      </div>
      {isContributor ? <ContributorContentManagement /> : <ContentReview />}
    </div>
  );
}