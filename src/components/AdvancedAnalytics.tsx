'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  contentPerformance: any[];
  learningTrends: any[];
  hubAnalytics: any[];
  subjectAnalytics: any[];
  engagementMetrics: any;
}

export default function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/analytics/advanced?days=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`http://localhost:3001/analytics/export?format=${format}`);
      if (!response.ok) {
        throw new Error('Export failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hiqma-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  // Default empty data structure if no data is available
  const defaultData = {
    engagementMetrics: {
      totalContent: 0,
      totalSessions: 0,
      completionRate: 0,
      avgQuizScore: 0
    },
    contentPerformance: [],
    subjectAnalytics: [],
    hubAnalytics: []
  };

  const displayData = data || defaultData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 bg-white text-black"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={() => exportData('json')}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Export JSON
          </button>
          <button
            onClick={() => exportData('csv')}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Engagement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-black">Total Content</h3>
          <p className="text-2xl font-bold text-blue-600">{displayData.engagementMetrics.totalContent}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-black">Total Sessions</h3>
          <p className="text-2xl font-bold text-green-600">{displayData.engagementMetrics.totalSessions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-black">Completion Rate</h3>
          <p className="text-2xl font-bold text-purple-600">
            {displayData.engagementMetrics.completionRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-black">Avg Quiz Score</h3>
          <p className="text-2xl font-bold text-orange-600">
            {displayData.engagementMetrics.avgQuizScore.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Content Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-black">Content Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Sessions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Avg Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Completion Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayData.contentPerformance.length > 0 ? (
                displayData.contentPerformance.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm font-medium text-black">{item.title}</td>
                    <td className="px-6 py-4 text-sm text-black">{item.category}</td>
                    <td className="px-6 py-4 text-sm text-black">{item.totalSessions}</td>
                    <td className="px-6 py-4 text-sm text-black">{item.avgTimeSpent?.toFixed(1)}m</td>
                    <td className="px-6 py-4 text-sm text-black">{item.completionRate?.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-sm text-black">{item.avgQuizScore?.toFixed(1)}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No content performance data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject Analytics */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-black">Subject Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayData.subjectAnalytics.length > 0 ? (
              displayData.subjectAnalytics.map((subject, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2 text-black">{subject.subject}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-black">Learners:</span>
                      <span className="font-medium text-black">{subject.uniqueLearners}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Sessions:</span>
                      <span className="font-medium text-black">{subject.totalSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Completion:</span>
                      <span className="font-medium text-black">{subject.completionRate?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Avg Score:</span>
                      <span className="font-medium text-black">{subject.avgQuizScore?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No subject analytics data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hub Analytics */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-black">Hub Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Hub ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Unique Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Total Sessions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Total Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Completions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayData.hubAnalytics.length > 0 ? (
                displayData.hubAnalytics.map((hub, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm font-medium text-black">{hub.hubId}</td>
                    <td className="px-6 py-4 text-sm text-black">{hub.uniqueUsers}</td>
                    <td className="px-6 py-4 text-sm text-black">{hub.totalSessions}</td>
                    <td className="px-6 py-4 text-sm text-black">{(hub.totalTimeSpent / 60).toFixed(1)}h</td>
                    <td className="px-6 py-4 text-sm text-black">{hub.totalCompletions}</td>
                    <td className="px-6 py-4 text-sm text-black">{hub.avgQuizScore?.toFixed(1)}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hub analytics data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}