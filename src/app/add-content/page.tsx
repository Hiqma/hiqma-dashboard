'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MultiStepContentForm } from '@/components/MultiStepContentForm';

export const dynamic = 'force-dynamic';

function AddContentPageContent() {
  const searchParams = useSearchParams();
  const contentId = searchParams.get('id');
  const isEdit = !!contentId;

  return <MultiStepContentForm contentId={contentId || undefined} isEdit={isEdit} />;
}

export default function AddContentPage() {
  return (
    <div className="pt-16 bg-[#f5f5f7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <AddContentPageContent />
        </Suspense>
      </div>
    </div>
  );
}