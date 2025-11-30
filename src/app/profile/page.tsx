'use client';

import { ModernSidebar } from '@/components/ModernSidebar';
import { UserProfile } from '@/components/UserProfile';
import { usePathname } from 'next/navigation';

export default function ProfilePage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen whiteboard-bg">
      <ModernSidebar currentPath={pathname} />
      <main className="lg:ml-64 p-8">
        <UserProfile />
      </main>
    </div>
  );
}