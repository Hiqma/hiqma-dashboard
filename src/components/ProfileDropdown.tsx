'use client';

import { useState, useEffect, useRef } from 'react';
import { UserCircleIcon, ChevronDownIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  email: string;
  name?: string;
  role: string;
  iat: number;
  exp: number;
}

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('Loading...');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        setUserName(decoded.name || decoded.email);
        setUserRole(decoded.role);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    
    // Trigger auth change event for immediate UI update
    window.dispatchEvent(new Event('authChange'));
    
    window.location.href = '/login';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <UserCircleIcon className="h-8 w-8 text-black" />
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-black">
            {userName}
          </div>
          <div className="text-xs text-gray-600">
            {userRole}
          </div>
        </div>
        <ChevronDownIcon className={`h-4 w-4 text-black transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1">
            <a
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100 flex items-center"
            >
              <UserIcon className="h-4 w-4 mr-3" />
              Profile
            </a>
            <hr className="border-gray-200" />
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}