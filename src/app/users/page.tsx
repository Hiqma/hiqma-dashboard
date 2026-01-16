'use client';

import { UsersManagement } from '@/components/UsersManagement';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Users
        </h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions.
        </p>
      </div>
      <UsersManagement />
    </div>
  );
}