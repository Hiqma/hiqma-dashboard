'use client';

import { useState, useEffect } from 'react';
import { analyticsApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EngagementStats {
  totalSessions: number;
  avgTimeSpent: number;
  completionRate: number;
}

interface ContentPopularity {
  contentId: string;
  sessions: number;
  avgTime: number;
}

export function Analytics() {
  const [engagementStats, setEngagementStats] = useState<EngagementStats | null>(null);
  const [contentPopularity, setContentPopularity] = useState<ContentPopularity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [engagementResponse, popularityResponse] = await Promise.all([
        analyticsApi.getEngagement(),
        analyticsApi.getContentPopularity(),
      ]);
      
      setEngagementStats(engagementResponse.data);
      setContentPopularity(popularityResponse.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Educational impact and engagement metrics from edge hubs.
          </p>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-lg font-medium text-gray-900">Total Sessions</div>
              </div>
            </div>
            <div className="mt-1 text-3xl font-semibold text-blue-600">
              {engagementStats?.totalSessions || 0}
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-lg font-medium text-gray-900">Avg Time (min)</div>
              </div>
            </div>
            <div className="mt-1 text-3xl font-semibold text-green-600">
              {Math.round(engagementStats?.avgTimeSpent || 0)}
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-lg font-medium text-gray-900">Completion Rate</div>
              </div>
            </div>
            <div className="mt-1 text-3xl font-semibold text-purple-600">
              {Math.round(engagementStats?.completionRate || 0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Content Popularity Chart */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Most Popular Content
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentPopularity.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="contentId" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.slice(0, 8) + '...'}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Content: ${value}`}
                  formatter={(value, name) => [value, name === 'sessions' ? 'Sessions' : 'Avg Time (min)']}
                />
                <Bar dataKey="sessions" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}