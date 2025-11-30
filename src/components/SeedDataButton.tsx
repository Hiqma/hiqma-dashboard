'use client';

import { useState } from 'react';
import { categoriesApiExtended, ageGroupsApi } from '@/lib/api';

export function SeedDataButton() {
  const [loading, setLoading] = useState(false);

  const seedData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        categoriesApiExtended.seed(),
        ageGroupsApi.seed(),
      ]);
      alert('Data seeded successfully!');
    } catch (error) {
      console.error('Failed to seed data:', error);
      alert('Failed to seed data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={seedData}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Seeding...' : 'Seed Categories & Age Groups'}
    </button>
  );
}