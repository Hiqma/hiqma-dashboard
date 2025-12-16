'use client';

import { useState, useEffect } from 'react';
import { DocumentTextIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActionDropdown } from './ActionDropdown';
import { contentController } from '@/controllers/contentController';
import { useToast } from '@/contexts/ToastContext';
import { authController } from '@/controllers/authController';
import { usersController } from '@/controllers/usersController';
import { EditContentForm } from './EditContentForm';

export function ContentReview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [contributorFilter, setContributorFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Get current user to check if super_admin
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const user = await authController.getCurrentUser();
        setIsSuperAdmin(user.role === 'super_admin' || user.role === 'moderator');
      } catch (error) {
        console.error('Failed to get user role:', error);
        setIsSuperAdmin(false);
      }
    };
    checkUserRole();
  }, []);

  // Fetch contributors list
  const { data: contributors = [] } = useQuery({
    queryKey: ['contributors'],
    queryFn: () => usersController.getContributors(),
    enabled: isSuperAdmin === true,
  });

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['admin-content', searchTerm, statusFilter, contributorFilter, currentPage, isSuperAdmin],
    queryFn: () => {
      // Use admin endpoint if super admin, otherwise use pending endpoint
      if (isSuperAdmin) {
        return contentController.getAdminContent({ 
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          contributorId: contributorFilter || undefined,
          page: currentPage, 
          limit: 10 
        });
      } else {
        return contentController.getPendingContent({ 
          search: searchTerm || undefined, 
          page: currentPage, 
          limit: 10 
        });
      }
    },
    enabled: isSuperAdmin !== null, // Only run query after we know the user role
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'verified' | 'rejected' }) =>
      contentController.updateContentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
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

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pending Review',
      verified: 'Verified',
      rejected: 'Rejected',
    };
    return labels[status as keyof typeof labels] || status;
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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search content by title or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
            />
          </div>
          
          {isSuperAdmin && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-black hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {isSuperAdmin && showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contributor
                </label>
                <select
                  value={contributorFilter}
                  onChange={(e) => {
                    setContributorFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                >
                  <option value="">All Contributors</option>
                  {contributors.map((contributor) => (
                    <option key={contributor.id} value={contributor.id}>
                      {contributor.name || contributor.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setContributorFilter('');
                    handleFilterChange();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Content
                </th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                    Contributor
                  </th>
                )}
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
                      {content.coverImageUrl ? (
                        <div className="w-12 h-16 mr-3 rounded overflow-hidden shadow-sm flex-shrink-0" style={{ aspectRatio: '3/4' }}>
                          <img
                            src={content.coverImageUrl}
                            alt={`Cover for ${content.title}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <DocumentTextIcon className="h-8 w-8 text-gray-400 mr-3 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
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
                  {isSuperAdmin && (
                    <td className="px-6 py-4 text-sm text-black">
                      {(content as any).contributor?.name || (content as any).contributor?.email || 'N/A'}
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-black">
                    {content.category?.name || (content as any).categories?.[0]?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    {content.language}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(content.status)}`}>
                      {getStatusLabel(content.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex gap-2">
                      <a
                        href={`/review-content/${content.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {content.status === 'verified' ? 'View' : 'Review'}
                      </a>
                      {isSuperAdmin && (
                        <button
                          onClick={() => setEditingContentId(content.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium ml-2"
                        >
                          Edit
                        </button>
                      )}
                      {content.status === 'pending' && (
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
                      )}
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

      {/* Edit Content Modal */}
      {editingContentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Edit Content</h2>
                <button
                  onClick={() => setEditingContentId(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <EditContentForm
                contentId={editingContentId}
                onClose={() => {
                  setEditingContentId(null);
                  queryClient.invalidateQueries({ queryKey: ['admin-content'] });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}