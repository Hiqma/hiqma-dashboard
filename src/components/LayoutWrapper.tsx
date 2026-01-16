'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the authenticated layout to prevent SSR issues
const AuthenticatedLayout = dynamic(() => import('./AuthenticatedLayout'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
});

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  const publicRoutes = ['/', '/login', '/landing'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const authToken = localStorage.getItem('authToken');
      // User is authenticated if both flags are present
      const authenticated = authStatus === 'true' && !!authToken;
      setIsAuthenticated(authenticated);
      
      // Redirect to login if not authenticated and not on a public route
      if (!authenticated && !isPublicRoute) {
        router.push('/login');
      }
    };

    checkAuth();

    // Listen for storage changes (including from same tab)
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab changes
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, [isPublicRoute, router]);

  // Show public routes immediately
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Show authenticated layout
  if (isAuthenticated) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  }

  // Not authenticated, will redirect to login
  return <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>;
}