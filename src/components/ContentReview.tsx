'use client';

import { useState, useEffect } from 'react';
import { DocumentTextIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActionDropdown } from './ActionDropdown';
import { contentController, Content, ContentResponse } from '@/controllers/contentController';
import { useToast } from '@/contexts/ToastContext';

export function ContentReview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['pending-content', searchTerm, currentPage],
    queryFn: () => contentController.getPendingContent({ 
      search: searchTerm || undefined, 
      page: currentPage, 
      limit: 10 
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'verified' | 'rejected' }) =>
      contentController.updateContentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-content'] });
      showToast('success', 'Status Updated', 'Content status updated successfully');
    },
    onError: () => {
      showToast('error', 'Update Failed', 'Failed to update content status');
    },
  });

  const handleStatusUpdate = (id: string, status: 'verified' | 'rejected') => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const pendingContent = contentData?.data || [];
  const totalPages = contentData?.totalPages || 1;

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
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Language
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
              {pendingContent.map((content) => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-black">
                          {content.title}
                        </div>
                        {content.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {content.description.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    {content.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    {content.language}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex gap-2">
                      <a
                        href={`/review-content/${content.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Review
                      </a>
                      <ActionDropdown
                        actions={[
                          {
                            label: 'Quick Approve',
                            onClick: () => handleStatusUpdate(content.id, 'verified'),
                            className: 'text-green-600',
                          },
                          {
                            label: 'Quick Reject',
                            onClick: () => handleStatusUpdate(content.id, 'rejected'),
                            className: 'text-red-600',
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingContent.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No content found matching your search.' : 'No pending content to review'}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} ({contentData?.total} total items)
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
    </div>
  );
}