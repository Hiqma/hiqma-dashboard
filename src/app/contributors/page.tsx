'use client';

import { ContributorApplications } from '@/components/ContributorApplications';

export default function ContributorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Contributors
        </h1>
        <p className="text-muted-foreground">
          Manage contributor applications and permissions.
        </p>
      </div>
      <ContributorApplications />
    </div>
  );
}