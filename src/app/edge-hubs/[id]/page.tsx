'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  SignalIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { hubsController } from '@/controllers/hubsController';
import { useToast } from '@/contexts/ToastContext';
import DeviceManagement from '@/components/DeviceManagement';
import StudentManagement from '@/components/StudentManagement';
import EnhancedAnalytics from '@/components/EnhancedAnalytics';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function HubDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hubId = params.id;
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'info' | 'content' | 'devices' | 'students' | 'analytics'>('info');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: hub, isLoading } = useQuery({
    queryKey: ['edge-hub', hubId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/edge-hubs/${hubId}`);
      return response.json();
    }
  });

  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: ['hub-content', hub?.hubId, assignmentFilter, searchTerm, currentPage],
    queryFn: () => {
      const assigned = assignmentFilter === 'all' ? undefined : assignmentFilter === 'assigned';
      return hubsController.getHubContent(hub.hubId, {
        assigned,
        search: searchTerm || undefined,
        page: currentPage,
        limit: 10
      });
    },
    enabled: activeTab === 'content' && !!hub?.hubId
  });

  const assignMutation = useMutation({
    mutationFn: ({ contentId }: { contentId: string }) =>
      hubsController.assignContent(hub.hubId, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hub-content'] });
      showToast('success', 'Content Assigned', 'Content assigned to hub successfully');
    },
    onError: () => {
      showToast('error', 'Assignment Failed', 'Failed to assign content to hub');
    }
  });

  const unassignMutation = useMutation({
    mutationFn: ({ contentId }: { contentId: string }) =>
      hubsController.unassignContent(hub.hubId, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hub-content'] });
      showToast('success', 'Content Unassigned', 'Content unassigned from hub successfully');
    },
    onError: () => {
      showToast('error', 'Unassignment Failed', 'Failed to unassign content from hub');
    }
  });

  const handleToggleAssignment = (contentId: string, isAssigned: boolean) => {
    if (isAssigned) {
      unassignMutation.mutate({ contentId });
    } else {
      assignMutation.mutate({ contentId });
    }
  };

  // Calculate stats from hub data
  const formatBytes = (bytes: number | null | undefined) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const calculateUptime = () => {
    if (!hub?.createdAt) return 'N/A';
    const now = new Date();
    const created = new Date(hub.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const getSyncStatus = () => {
    if (!hub?.lastSyncAt) return 'Never Synced';
    const lastSync = new Date(hub.lastSyncAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return 'Online';
    if (diffMinutes < 1440) return 'Recently Synced';
    return 'Offline';
  };

  const stats = {
    totalReaders: hub?.totalReaders || 0,
    totalContent: hub?.totalContent || 0,
    activeReaders: hub?.activeReaders || 0,
    syncStatus: getSyncStatus(),
    dataTransferred: formatBytes(hub?.dataTransferred ? Number(hub.dataTransferred) : 0),
    uptime: calculateUptime()
  };

  if (isLoading) {
    return (
      <div className="pt-16 bg-[#f5f5f7] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="pt-16 bg-[#f5f5f7] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black">Hub not found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-[#f5f5f7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-black">{hub.name}</h1>
              <p className="text-gray-600 mt-1">Hub Details & Performance</p>
            </div>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            hub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {hub.status}
          </span>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Hub Information
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content Assignment
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'devices'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Device Management
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Student Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Readers</p>
                <p className="text-2xl font-bold text-black mt-1">{stats.totalReaders.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Items</p>
                <p className="text-2xl font-bold text-black mt-1">{stats.totalContent.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Synced locally</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Readers</p>
                <p className="text-2xl font-bold text-black mt-1">{stats.activeReaders.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </div>
              <SignalIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Synced</p>
                <p className="text-2xl font-bold text-black mt-1">{stats.dataTransferred}</p>
                <p className="text-xs text-gray-500 mt-1">Total size</p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-black mb-6">Hub Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Hub ID</label>
                <p className="text-black font-mono bg-gray-100 px-3 py-2 rounded mt-1">{hub.hubId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-black mt-1">{hub.address}</p>
                {hub.latitude && hub.longitude && (
                  <p className="text-sm text-gray-500">
                    {Number(hub.latitude).toFixed(6)}, {Number(hub.longitude).toFixed(6)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-black mt-1">{hub.description || 'No description provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-black mt-1">{new Date(hub.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-black mb-6">Performance Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sync Status</span>
                <span className={`px-2 py-1 text-sm rounded-full ${
                  stats.syncStatus === 'Online' ? 'bg-green-100 text-green-800' : 
                  stats.syncStatus === 'Recently Synced' ? 'bg-yellow-100 text-yellow-800' :
                  stats.syncStatus === 'Never Synced' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {stats.syncStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Sync</span>
                <span className="text-black">{hub.lastSyncAt ? new Date(hub.lastSyncAt).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Metrics Update</span>
                <span className="text-black">{hub.lastMetricsUpdate ? new Date(hub.lastMetricsUpdate).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hub Age</span>
                <span className="text-black">{stats.uptime}</span>
              </div>
            </div>
          </div>
        </div>

        {hub.latitude && hub.longitude && (
          <div className="bg-white rounded-xl p-6 shadow-sm mt-8">
            <div className="flex items-center mb-4">
              <MapPinIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-xl font-bold text-black">Location</h2>
            </div>
            <div className="h-64 bg-gray-200 rounded-lg">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(hub.longitude)-0.01},${Number(hub.latitude)-0.01},${Number(hub.longitude)+0.01},${Number(hub.latitude)+0.01}&layer=mapnik&marker=${hub.latitude},${hub.longitude}`}
                width="100%"
                height="100%"
                className="rounded-lg"
                title="Hub Location"
              />
            </div>
          </div>
        )}
          </>
        )}

        {/* Content Assignment Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center gap-4">
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
                
                <select
                  value={assignmentFilter}
                  onChange={(e) => {
                    setAssignmentFilter(e.target.value as 'all' | 'assigned' | 'unassigned');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-black"
                >
                  <option value="all">All Content</option>
                  <option value="assigned">Assigned Only</option>
                  <option value="unassigned">Unassigned Only</option>
                </select>
              </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              {contentLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : (
                <>
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
                        {contentData?.data?.map((content: any) => (
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
                              {content.contentCategories?.[0]?.category?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-black">
                              {content.language}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                content.isAssigned 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {content.isAssigned ? 'Assigned' : 'Not Assigned'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <button
                                onClick={() => handleToggleAssignment(content.id, content.isAssigned)}
                                disabled={assignMutation.isPending || unassignMutation.isPending}
                                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                                  content.isAssigned
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                } disabled:opacity-50`}
                              >
                                {content.isAssigned ? 'Unassign' : 'Assign'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {contentData?.data?.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No content found matching your search.' : 'No content available'}
                      </div>
                    )}
                  </div>
                  
                  {/* Pagination */}
                  {contentData?.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        Page {currentPage} of {contentData.totalPages} ({contentData.total} total items)
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
                          onClick={() => setCurrentPage(prev => Math.min(contentData.totalPages, prev + 1))}
                          disabled={currentPage === contentData.totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Device Management Tab */}
        {activeTab === 'devices' && (
          <DeviceManagement hubId={hub.hubId} />
        )}

        {/* Student Management Tab */}
        {activeTab === 'students' && (
          <StudentManagement hubId={hub.hubId} />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <EnhancedAnalytics hubId={hub.hubId} />
        )}
      </div>
    </div>
  );
}