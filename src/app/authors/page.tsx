'use client';

import { AuthorsManagement } from '@/components/AuthorsManagement';

export default function AuthorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Authors
        </h1>
        <p className="text-muted-foreground">
          Manage content authors and their profiles.
        </p>
      </div>
      <AuthorsManagement />
    </div>
  );
}