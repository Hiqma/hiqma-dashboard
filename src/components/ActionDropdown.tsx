'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

interface ActionItem {
  label: string;
  onClick: () => void;
  className?: string;
}

interface ActionDropdownProps {
  actions: ActionItem[];
}

export function ActionDropdown({ actions }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 128 + window.scrollX // 128px = w-32
      });
    }
    setIsOpen(!isOpen);
  };

  const dropdownContent = isOpen ? (
    <div 
      ref={dropdownRef}
      className="fixed z-[9999] w-32 bg-white border border-gray-200 rounded-md shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <div className="py-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.onClick();
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
              action.className || 'text-black'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
      >
        <EllipsisVerticalIcon className="h-5 w-5 text-black" />
      </button>

      {typeof window !== 'undefined' && dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  );
}