'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  SignalIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function HubDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hubId = params.id;

  const { data: hub, isLoading } = useQuery({
    queryKey: ['edge-hub', hubId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/edge-hubs/${hubId}`);
      return response.json();
    }
  });

  const stats = {
    totalStudents: 245,
    totalContent: 89,
    activeUsers: 67,
    syncStatus: 'Online',
    dataTransferred: '2.3 GB',
    uptime: '99.2%'
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-black mt-1">{stats.totalStudents}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Items</p>
                <p className="text-2xl font-bold text-black mt-1">{stats.totalContent}</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-black mt-1">{stats.activeUsers}</p>
              </div>
              <SignalIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-black mt-1">{stats.uptime}</p>
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
                  stats.syncStatus === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {stats.syncStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Sync</span>
                <span className="text-black">{hub.lastSyncAt ? new Date(hub.lastSyncAt).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Data Transferred</span>
                <span className="text-black">{stats.dataTransferred}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">System Uptime</span>
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
      </div>
    </div>
  );
}