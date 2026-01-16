'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MultiStepContentForm } from '@/components/MultiStepContentForm';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

function AddContentPageContent() {
  const searchParams = useSearchParams();
  const contentId = searchParams.get('id');
  const isEdit = !!contentId;

  return <MultiStepContentForm contentId={contentId || undefined} isEdit={isEdit} />;
}

export default function AddContentPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    }>
      <AddContentPageContent />
    </Suspense>
  );
}