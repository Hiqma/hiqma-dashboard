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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { hubsController } from '@/controllers/hubsController';
import { useToast } from '@/contexts/ToastContext';
import DeviceManagement from '@/components/DeviceManagement';
import StudentManagement from '@/components/StudentManagement';
import EnhancedAnalytics from '@/components/EnhancedAnalytics';
import { HubSettings } from '@/components/HubSettings';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export default function HubDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hubId = params.id;
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'info' | 'content' | 'devices' | 'students' | 'analytics' | 'settings'>('info');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: hub, isLoading } = useQuery({
    queryKey: ['edge-hub', hubId],
    queryFn: async () => {
      if (!hubId) {
        throw new Error('Hub ID is required');
      }
      const response = await fetch(`${API_BASE}/edge-hubs/${hubId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch hub details');
      }
      return response.json();
    },
    enabled: !!hubId
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
      <div className="pt-16 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="pt-16 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Hub not found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{hub.name}</h1>
              <p className="text-muted-foreground mt-1">Hub Details & Performance</p>
            </div>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            hub.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-muted text-muted-foreground'
          }`}>
            {hub.status}
          </span>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              Hub Information
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              Content Assignment
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'devices'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              Device Management
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              Student Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Readers</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalReaders.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Content Items</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalContent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Synced locally</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Readers</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.activeReaders.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              </div>
              <SignalIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Synced</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.dataTransferred}</p>
                <p className="text-xs text-muted-foreground mt-1">Total size</p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Hub Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hub ID</label>
                <p className="text-foreground font-mono bg-muted px-3 py-2 rounded mt-1">{hub.hubId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-foreground mt-1">{hub.address}</p>
                {hub.latitude && hub.longitude && (
                  <p className="text-sm text-muted-foreground">
                    {Number(hub.latitude).toFixed(6)}, {Number(hub.longitude).toFixed(6)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-foreground mt-1">{hub.description || 'No description provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-foreground mt-1">{new Date(hub.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Performance Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Sync Status</span>
                <span className={`px-2 py-1 text-sm rounded-full ${
                  stats.syncStatus === 'Online' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                  stats.syncStatus === 'Recently Synced' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  stats.syncStatus === 'Never Synced' ? 'bg-muted text-muted-foreground' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {stats.syncStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="text-foreground">{hub.lastSyncAt ? new Date(hub.lastSyncAt).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last Metrics Update</span>
                <span className="text-foreground">{hub.lastMetricsUpdate ? new Date(hub.lastMetricsUpdate).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Hub Age</span>
                <span className="text-foreground">{stats.uptime}</span>
              </div>
            </div>
          </div>
        </div>

        {hub.latitude && hub.longitude && (
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border mt-8">
            <div className="flex items-center mb-4">
              <MapPinIcon className="h-5 w-5 text-muted-foreground mr-2" />
              <h2 className="text-xl font-bold text-foreground">Location</h2>
            </div>
            <div className="h-64 bg-muted rounded-lg">
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
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground"
                  />
                </div>
                
                <select
                  value={assignmentFilter}
                  onChange={(e) => {
                    setAssignmentFilter(e.target.value as 'all' | 'assigned' | 'unassigned');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-input rounded-lg bg-background text-foreground"
                >
                  <option value="all">All Content</option>
                  <option value="assigned">Assigned Only</option>
                  <option value="unassigned">Unassigned Only</option>
                </select>
              </div>
            </div>

            {/* Content Table */}
            <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
              {contentLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Content
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Language
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {contentData?.data?.map((content: any) => (
                          <tr key={content.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <DocumentTextIcon className="h-8 w-8 text-muted-foreground mr-3" />
                                <div>
                                  <div className="text-sm font-medium text-foreground">
                                    {content.title}
                                  </div>
                                  {content.description && (
                                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                                      {content.description.substring(0, 100)}...
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">
                              {content.contentCategories?.[0]?.category?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">
                              {content.language}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                content.isAssigned 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                  : 'bg-muted text-muted-foreground'
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
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
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
                      <div className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No content found matching your search.' : 'No content available'}
                      </div>
                    )}
                  </div>
                  
                  {/* Pagination */}
                  {contentData?.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {contentData.totalPages} ({contentData.total} total items)
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-input rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted text-foreground"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(contentData.totalPages, prev + 1))}
                          disabled={currentPage === contentData.totalPages}
                          className="px-3 py-1 text-sm border border-input rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted text-foreground"
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
          hub?.hubId ? (
            <DeviceManagement hubId={hub.hubId} />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="text-center text-gray-500 dark:text-gray-400">
                Loading hub information...
              </div>
            </div>
          )
        )}

        {/* Student Management Tab */}
        {activeTab === 'students' && (
          hub?.hubId ? (
            <StudentManagement hubId={hub.hubId} />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="text-center text-gray-500 dark:text-gray-400">
                {isLoading ? 'Loading hub information...' : 'Hub information not available'}
              </div>
            </div>
          )
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          hub?.hubId ? (
            <EnhancedAnalytics hubId={hub.hubId} />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="text-center text-gray-500 dark:text-gray-400">
                Loading hub information...
              </div>
            </div>
          )
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          hub?.hubId ? (
            <HubSettings hubId={hub.hubId} />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="text-center text-gray-500 dark:text-gray-400">
                Loading hub information...
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}