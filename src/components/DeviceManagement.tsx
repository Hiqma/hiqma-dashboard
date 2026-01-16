'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DevicePhoneMobileIcon,
  PlusIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { devicesController, Device } from '@/controllers/devicesController';
import { useToast } from '@/contexts/ToastContext';

interface DeviceManagementProps {
  hubId: string;
}

export default function DeviceManagement({ hubId }: DeviceManagementProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deviceCount, setDeviceCount] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Fetch devices
  const { data: devicesData, isLoading } = useQuery({
    queryKey: ['hub-devices', hubId, statusFilter, searchTerm, currentPage],
    queryFn: () => devicesController.getHubDevices(hubId, {
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchTerm || undefined,
      page: currentPage,
      limit: 10
    }),
  });

  // Fetch device stats
  const { data: deviceStats } = useQuery({
    queryKey: ['hub-device-stats', hubId],
    queryFn: () => devicesController.getDeviceStats(hubId),
  });

  // Create devices mutation
  const createDevicesMutation = useMutation({
    mutationFn: (count: number) => devicesController.createDevices(hubId, { count }),
    onSuccess: (devices) => {
      queryClient.invalidateQueries({ queryKey: ['hub-devices'] });
      queryClient.invalidateQueries({ queryKey: ['hub-device-stats'] });
      setShowCreateModal(false);
      showToast('success', 'Devices Created', `Successfully created ${devices.length} devices`);
    },
    onError: (error: Error) => {
      showToast('error', 'Creation Failed', error.message);
    }
  });

  // Regenerate device code mutation
  const regenerateCodeMutation = useMutation({
    mutationFn: (deviceId: string) => devicesController.regenerateDeviceCode(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hub-devices'] });
      showToast('success', 'Code Regenerated', 'Device code regenerated successfully');
    },
    onError: (error: Error) => {
      showToast('error', 'Regeneration Failed', error.message);
    }
  });

  // Delete device mutation
  const deleteDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => devicesController.deleteDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hub-devices'] });
      queryClient.invalidateQueries({ queryKey: ['hub-device-stats'] });
      setShowDeleteModal(null);
      showToast('success', 'Device Deleted', 'Device deleted successfully');
    },
    onError: (error: Error) => {
      showToast('error', 'Deletion Failed', error.message);
    }
  });

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('success', 'Copied', 'Device code copied to clipboard');
    } catch (error) {
      showToast('error', 'Copy Failed', 'Failed to copy device code');
    }
  };

  const handleExportCodes = async () => {
    try {
      const blob = await devicesController.exportDeviceCodes(hubId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hub-${hubId}-device-codes.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('success', 'Export Complete', 'Device codes exported successfully');
    } catch (error) {
      showToast('error', 'Export Failed', 'Failed to export device codes');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'registered':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
              <p className="text-2xl font-bold text-foreground mt-1">{deviceStats?.total || 0}</p>
            </div>
            <DevicePhoneMobileIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-foreground mt-1">{deviceStats?.active || 0}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Registered</p>
              <p className="text-2xl font-bold text-foreground mt-1">{deviceStats?.registered || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold text-foreground mt-1">{deviceStats?.inactive || 0}</p>
            </div>
            <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-muted-foreground rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="registered">Registered</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportCodes}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Create Devices
            </button>
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Last Seen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {devicesData?.devices?.map((device: Device) => (
                    <tr key={device.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DevicePhoneMobileIcon className="h-8 w-8 text-muted-foreground mr-3" />
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {device.name || `Device ${device.deviceCode}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Created {formatDate(device.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-muted rounded text-sm font-mono text-foreground">
                            {device.deviceCode}
                          </code>
                          <button
                            onClick={() => handleCopyCode(device.deviceCode)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="Copy code"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(device.status)}`}>
                          {device.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(device.lastSeen)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => regenerateCodeMutation.mutate(device.id)}
                            disabled={regenerateCodeMutation.isPending}
                            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Regenerate code"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(device.id)}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete device"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {devicesData?.devices?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No devices found matching your search.' : 'No devices created yet'}
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {devicesData && devicesData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-foreground">
                  Page {currentPage} of {devicesData.totalPages} ({devicesData.total} total devices)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(devicesData.totalPages, prev + 1))}
                    disabled={currentPage === devicesData.totalPages}
                    className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Devices Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md border border-border">
            <h3 className="text-lg font-medium text-foreground mb-4">Create New Devices</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Number of devices to create
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={deviceCount}
                  onChange={(e) => setDeviceCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Each device will get a unique code for registration
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-foreground border border-border rounded-lg hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                onClick={() => createDevicesMutation.mutate(deviceCount)}
                disabled={createDevicesMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createDevicesMutation.isPending ? 'Creating...' : 'Create Devices'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md border border-border">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-medium text-foreground">Delete Device</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this device? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 text-foreground border border-border rounded-lg hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteDeviceMutation.mutate(showDeleteModal)}
                disabled={deleteDeviceMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteDeviceMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}