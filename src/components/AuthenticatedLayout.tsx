'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { GlobalSearch } from '@/components/global-search';
import { ModeToggle } from '@/components/mode-toggle';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { LanguageSelector } from '@/components/LanguageSelector';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className="flex flex-1 flex-col overflow-hidden transition-all duration-200 ease-linear peer-data-[state=expanded]:ml-64 peer-data-[state=collapsed]:ml-12 md:peer-data-[state=expanded]:ml-64 md:peer-data-[state=collapsed]:ml-12">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          
          {/* Centered Global Search */}
          <div className="flex flex-1 justify-center">
            <div className="w-full max-w-md">
              <GlobalSearch />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ModeToggle />
            <ProfileDropdown />
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}