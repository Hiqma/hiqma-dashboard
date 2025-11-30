'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { authorsController, Author, CreateAuthorData } from '@/controllers/authorsController';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import { AuthorDetailModal } from './AuthorDetailModal';
import { AuthorFormModal } from './AuthorFormModal';
import { ActionDropdown } from './ActionDropdown';

export function AuthorsManagement() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [viewingAuthor, setViewingAuthor] = useState<Author | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    nationality: '',
    birthYear: '',
  });

  const { data: authorsData, isLoading } = useQuery({
    queryKey: ['authors', searchTerm, currentPage],
    queryFn: () => authorsController.search({ search: searchTerm, page: currentPage, limit: 10 }),
  });

  const authors = authorsData?.data || [];
  const totalPages = authorsData?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: authorsController.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      resetForm();
      showToast('success', 'Author Created', 'Author has been successfully created.');
    },
    onError: () => {
      showToast('error', 'Creation Failed', 'Failed to create author. Please try again.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAuthorData }) => 
      authorsController.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      resetForm();
      showToast('success', 'Author Updated', 'Author has been successfully updated.');
    },
    onError: () => {
      showToast('error', 'Update Failed', 'Failed to update author. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: authorsController.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      showToast('success', 'Author Deleted', 'Author has been successfully deleted.');
    },
    onError: () => {
      showToast('error', 'Deletion Failed', 'Failed to delete author. Please try again.');
    },
  });

  const handleSubmit = (payload: CreateAuthorData) => {
    if (editingAuthor) {
      updateMutation.mutate({ id: editingAuthor.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Author',
      message: 'Are you sure you want to delete this author? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      bio: author.bio || '',
      nationality: author.nationality || '',
      birthYear: author.birthYear?.toString() || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', bio: '', nationality: '', birthYear: '' });
    setEditingAuthor(null);
    setShowForm(false);
  };

  const handleView = (author: Author) => {
    setViewingAuthor(author);
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
            placeholder="Search authors..."
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
          Add Author
        </button>
      </div>



      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Nationality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Birth Year
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
              {authors?.map((author) => (
                <tr key={author.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-black">
                          {author.name}
                        </div>
                        {author.bio && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {author.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    {author.nationality || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    {author.birthYear || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      author.isContributor 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {author.isContributor ? 'Contributor' : 'Author'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <ActionDropdown
                      actions={[
                        {
                          label: 'View Details',
                          onClick: () => handleView(author),
                        },
                        {
                          label: 'Edit',
                          onClick: () => handleEdit(author),
                        },
                        {
                          label: 'Delete',
                          onClick: () => handleDelete(author.id),
                          className: 'text-red-600',
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {authors?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No authors found matching your search.' : 'No authors found. Add your first author to get started.'}
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

      {/* Author Form Modal */}
      <AuthorFormModal
        isOpen={showForm}
        onClose={resetForm}
        onSubmit={handleSubmit}
        editingAuthor={editingAuthor}
        formData={formData}
        setFormData={setFormData}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Author Detail Modal */}
      {viewingAuthor && (
        <AuthorDetailModal
          author={viewingAuthor}
          onClose={() => setViewingAuthor(null)}
        />
      )}
    </div>
  );
}
