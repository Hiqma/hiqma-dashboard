'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  GlobeAltIcon, 
  KeyIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { LocationSelector } from '@/components/LocationSelector';
import { ActionDropdown } from '@/components/ActionDropdown';

interface EdgeHub {
  id: number;
  hubId: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  encryptionKey: string;
  status: string;
  description?: string;
  createdAt: string;
  lastSyncAt?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EdgeHubsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    description: ''
  });

  const queryClient = useQueryClient();

  const { data: hubs = [], isLoading } = useQuery({
    queryKey: ['edge-hubs'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/edge-hubs`);
      return response.json();
    }
  });

  const createHubMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${API_BASE}/edge-hubs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edge-hubs'] });
      setShowAddForm(false);
      setFormData({ name: '', address: '', latitude: null, longitude: null, description: '' });
    }
  });

  const toggleHubStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await fetch(`${API_BASE}/edge-hubs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edge-hubs'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createHubMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="pt-2 bg-[#f5f5f7] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 bg-[#f5f5f7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Edge Hubs</h1>
            <p className="text-gray-600 mt-1">Manage distributed content delivery hubs</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg font-medium"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Hub
          </motion.button>
        </div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 mb-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-black mb-4">Add New Edge Hub</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Hub Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Location</label>
                <LocationSelector
                  value={{
                    address: formData.address,
                    latitude: formData.latitude,
                    longitude: formData.longitude
                  }}
                  onChange={(location) => setFormData({
                    ...formData,
                    address: location.address,
                    latitude: location.latitude,
                    longitude: location.longitude
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={createHubMutation.isPending}
                  className="px-4 py-2 bg-black text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {createHubMutation.isPending ? 'Creating...' : 'Create Hub'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 text-black rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Hub</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Hub ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Last Sync</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hubs.map((hub: EdgeHub) => (
                  <tr key={hub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <GlobeAltIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-black">{hub.name}</div>
                          {hub.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{hub.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      <div className="truncate max-w-xs">{hub.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        hub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {hub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{hub.hubId}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {hub.lastSyncAt ? new Date(hub.lastSyncAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <ActionDropdown
                        actions={[
                          {
                            label: 'View Details',
                            onClick: () => window.location.href = `/edge-hubs/${hub.id}`,
                          },
                          {
                            label: hub.status === 'active' ? 'Suspend' : 'Activate',
                            onClick: () => toggleHubStatusMutation.mutate({ 
                              id: hub.id, 
                              status: hub.status === 'active' ? 'inactive' : 'active' 
                            }),
                            className: hub.status === 'active' ? 'text-red-600' : 'text-green-600',
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hubs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No edge hubs registered yet. Add your first hub to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}