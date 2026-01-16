'use client';

import { CategoriesManagement } from '@/components/CategoriesManagement';

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Categories
        </h1>
        <p className="text-muted-foreground">
          Manage content categories and their hierarchical structure.
        </p>
      </div>
      <CategoriesManagement />
    </div>
  );
}