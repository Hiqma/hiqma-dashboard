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
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-black mt-1">{deviceStats?.total || 0}</p>
            </div>
            <DevicePhoneMobileIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-black mt-1">{deviceStats?.active || 0}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registered</p>
              <p className="text-2xl font-bold text-black mt-1">{deviceStats?.registered || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-black mt-1">{deviceStats?.inactive || 0}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-black"
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Create Devices
            </button>
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Seen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {devicesData?.devices?.map((device: Device) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DevicePhoneMobileIcon className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {device.name || `Device ${device.deviceCode}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              Created {formatDate(device.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {device.deviceCode}
                          </code>
                          <button
                            onClick={() => handleCopyCode(device.deviceCode)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy code"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(device.status)}`}>
                          {device.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(device.lastSeen)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => regenerateCodeMutation.mutate(device.id)}
                            disabled={regenerateCodeMutation.isPending}
                            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="Regenerate code"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(device.id)}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
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
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No devices found matching your search.' : 'No devices created yet'}
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {devicesData && devicesData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {devicesData.totalPages} ({devicesData.total} total devices)
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
                    onClick={() => setCurrentPage(prev => Math.min(devicesData.totalPages, prev + 1))}
                    disabled={currentPage === devicesData.totalPages}
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

      {/* Create Devices Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Devices</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of devices to create
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={deviceCount}
                  onChange={(e) => setDeviceCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Each device will get a unique code for registration
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createDevicesMutation.mutate(deviceCount)}
                disabled={createDevicesMutation.isPending}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {createDevicesMutation.isPending ? 'Creating...' : 'Create Devices'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900">Delete Device</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this device? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
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