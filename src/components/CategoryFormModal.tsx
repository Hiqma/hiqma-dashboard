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
    <div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card shadow-xl overflow-y-auto border-l border-border"
      >
        <div className="flex items-center justify-between mb-6 p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
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
            <label className="block text-sm font-medium mb-2 text-foreground">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              placeholder="Enter category description..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              {isLoading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-muted text-foreground px-6 py-2 rounded-lg font-medium hover:bg-muted/80 flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}