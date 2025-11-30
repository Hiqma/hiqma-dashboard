'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { Category, CreateCategoryData, categoriesController } from '@/controllers/categoriesController';
import { SearchableSelect } from './SearchableSelect';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryData) => void;
  editingCategory: Category | null;
  formData: {
    name: string;
    description: string;
    parentId: string;
  };
  setFormData: (data: any) => void;
  isLoading?: boolean;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  formData,
  setFormData,
  isLoading = false
}: CategoryFormModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories-search', searchTerm],
    queryFn: () => categoriesController.search({ search: searchTerm, page: 1, limit: 50 }),
    enabled: isOpen,
  });

  const categories = categoriesData?.data || [];
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateCategoryData = {
      ...formData,
      parentId: formData.parentId || undefined,
    };
    onSubmit(payload);
  };

  const handleCategorySearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredCategories = categories.filter(cat => 
    editingCategory?.id !== cat.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-black">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              Parent Category
            </label>
            <SearchableSelect
              value={formData.parentId}
              onChange={(value) => setFormData({ ...formData, parentId: value })}
              onSearch={handleCategorySearch}
              options={filteredCategories}
              placeholder="No Parent (Root Category)"
              isLoading={categoriesLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter category description..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              {isLoading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}