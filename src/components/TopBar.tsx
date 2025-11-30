'use client';

import { ProfileDropdown } from './ProfileDropdown';
import { LanguageSelector } from './LanguageSelector';

export function TopBar() {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 sticky top-0 z-50 shadow-sm ml-64">
      <div className="flex items-center space-x-2">
        <LanguageSelector />
        <ProfileDropdown />
      </div>
    </div>
  );
}