'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon, MagnifyingGlassIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { contributorsController, Application } from '@/controllers/contributorsController';
import { useToast } from '@/contexts/ToastContext';

export function ContributorApplications() {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { showToast } = useToast();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['contributor-applications'],
    queryFn: contributorsController.getApplications,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      contributorsController.reviewApplication(id, status, null),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['contributor-applications'] });
      setSelectedApp(null);
      showToast('success', 'Application Reviewed', `Application ${status} successfully!`);
    },
    onError: () => {
      showToast('error', 'Review Failed', 'Failed to review application');
    },
  });

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.expertise.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const handleReview = (id: string, status: 'approved' | 'rejected') => {
    reviewMutation.mutate({ id, status });
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
      {/* Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-end gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 rounded-lg">
            <ClockIcon className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              Pending: {applications.filter(a => a.status === 'pending').length}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">
              Approved: {applications.filter(a => a.status === 'approved').length}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-100 rounded-lg">
            <XCircleIcon className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-800">
              Rejected: {applications.filter(a => a.status === 'rejected').length}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="ml-4 px-4 py-2 border border-gray-300 rounded-lg bg-white text-black"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications List */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-black mb-4">
            Applications ({filteredApplications.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredApplications?.map((app) => (
              <div
                key={app.id}
                className={`p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                  selectedApp?.id === app.id 
                    ? 'bg-blue-50 border-2 border-blue-500' 
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedApp(app)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <AcademicCapIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">{app.name}</h4>
                      <p className="text-sm text-gray-600">{app.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-700 font-medium">{app.institution}</p>
                  <p className="text-sm text-gray-600 truncate">{app.expertise}</p>
                  <p className="text-xs text-gray-500">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {filteredApplications?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No applications found</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Try adjusting your search terms</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {selectedApp ? (
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <AcademicCapIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-black">{selectedApp.name}</h2>
                  <p className="text-gray-600 text-lg">{selectedApp.email}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedApp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedApp.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-black mb-2 flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Institution
                  </h3>
                  <p className="text-gray-700">{selectedApp.institution}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-black mb-2 flex items-center gap-2">
                    <AcademicCapIcon className="h-5 w-5" />
                    Areas of Expertise
                  </h3>
                  <p className="text-gray-700">{selectedApp.expertise}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-black mb-2">Motivation</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedApp.motivation}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-black mb-2 flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    Application Date
                  </h3>
                  <p className="text-gray-700">
                    {new Date(selectedApp.appliedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedApp.status === 'pending' && (
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleReview(selectedApp.id, 'approved')}
                    disabled={reviewMutation.isPending}
                    className="flex-1 bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    {reviewMutation.isPending ? 'Processing...' : 'Approve Application'}
                  </button>
                  <button
                    onClick={() => handleReview(selectedApp.id, 'rejected')}
                    disabled={reviewMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    {reviewMutation.isPending ? 'Processing...' : 'Reject Application'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Application Selected</h3>
              <p>Choose an application from the list to view detailed information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}