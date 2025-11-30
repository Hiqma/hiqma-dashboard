'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  AcademicCapIcon,
  FolderIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';


const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Content', href: '/content', icon: DocumentTextIcon },
  { name: 'Categories', href: '/categories', icon: FolderIcon },
  { name: 'Contributors', href: '/contributors', icon: UserGroupIcon },
  { name: 'Users', href: '/users', icon: UserGroupIcon },
  { name: 'Edge Hubs', href: '/edge-hubs', icon: GlobeAltIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Authors', href: '/authors', icon: AcademicCapIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

interface ModernSidebarProps {
  currentPath: string;
}

export function ModernSidebar({ currentPath }: ModernSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img src="/assets/logo.png" alt="Hiqma Logo" className="w-8 h-8" />
              <div>
                <h1 className="text-lg font-bold text-black">
                  Hiqma
                </h1>
                <p className="text-xs text-gray-600">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = currentPath === item.href || 
                (item.href === '/dashboard' && currentPath === '/') ||
                (item.href === '/content' && currentPath === '/add-content');
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`
                      flex items-center px-6 py-4 rounded-lg text-lg font-medium transition-all cursor-pointer hover:scale-105
                      ${isActive
                        ? 'bg-black text-white shadow-lg'
                        : 'text-black hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="mr-5 h-7 w-7" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>


        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
        />
      )}
    </>
  );
}