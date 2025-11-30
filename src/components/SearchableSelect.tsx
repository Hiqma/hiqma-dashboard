'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Category } from '@/controllers/categoriesController';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (term: string) => void;
  options: Category[];
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  onSearch,
  options,
  placeholder = "Select option...",
  isLoading = false,
  disabled = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch]);

  const selectedOption = options.find(option => option.id === value);

  const renderCategoryName = (category: Category) => {
    return '  '.repeat(category.level) + category.name;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selectedOption ? '' : 'text-gray-500'}>
          {selectedOption ? renderCategoryName(selectedOption) : placeholder}
        </span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded bg-white text-black placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
            >
              No Parent (Root Category)
            </button>
            
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                Loading...
              </div>
            ) : options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No categories found
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-black"
                >
                  {renderCategoryName(option)}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}