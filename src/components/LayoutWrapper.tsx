'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TopBar } from './TopBar';
import { ModernSidebar } from './ModernSidebar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  
  const publicRoutes = ['/', '/login', '/landing'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(authStatus === 'true');
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
  }, []);

  return (
    <>
      {isAuthenticated && !isPublicRoute && (
        <>
          <TopBar />
          <ModernSidebar currentPath={pathname} />
          <div className="lg:ml-64">
            {children}
          </div>
        </>
      )}
      {(!isAuthenticated || isPublicRoute) && children}
    </>
  );
}