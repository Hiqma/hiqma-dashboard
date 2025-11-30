'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, FolderIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { categoriesController, Category, CreateCategoryData } from '@/controllers/categoriesController';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import { CategoryFormModal } from './CategoryFormModal';
import { ActionDropdown } from './ActionDropdown';

export function CategoriesManagement() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
  });

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories', searchTerm, currentPage],
    queryFn: () => categoriesController.search({ search: searchTerm, page: currentPage, limit: 10 }),
  });



  const categories = categoriesData?.data || [];
  const totalPages = categoriesData?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: categoriesController.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
      showToast('success', 'Category Created', 'Category has been successfully created.');
    },
    onError: () => {
      showToast('error', 'Creation Failed', 'Failed to create category. Please try again.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCategoryData }) => 
      categoriesController.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
      showToast('success', 'Category Updated', 'Category has been successfully updated.');
    },
    onError: () => {
      showToast('error', 'Update Failed', 'Failed to update category. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesController.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast('success', 'Category Deleted', 'Category has been successfully deleted.');
    },
    onError: (error: any) => {
      const message = error.message?.includes('subcategories') 
        ? 'Cannot delete category with subcategories.'
        : 'Failed to delete category. Please try again.';
      showToast('error', 'Deletion Failed', message);
    },
  });

  const handleSubmit = (payload: CreateCategoryData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parentId: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  const getCategoryPath = (category: Category) => {
    if (!category.parent) return category.name;
    return `${getCategoryPath(category.parent)} > ${category.name}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2 ml-4"
        >
          <PlusIcon className="h-5 w-5" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories?.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FolderIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-black">
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    {getCategoryPath(category)}
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    Level {category.level}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <ActionDropdown
                      actions={[
                        {
                          label: 'Edit',
                          onClick: () => handleEdit(category),
                        },
                        {
                          label: 'Delete',
                          onClick: () => handleDelete(category.id),
                          className: 'text-red-600',
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No categories found matching your search.' : 'No categories found. Add your first category to get started.'}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={showForm}
        onClose={resetForm}
        onSubmit={handleSubmit}
        editingCategory={editingCategory}
        formData={formData}
        setFormData={setFormData}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}