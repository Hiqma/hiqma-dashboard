'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FunnelIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  AcademicCapIcon,
  ClockIcon,
  TrophyIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { analyticsController, AnalyticsFilters, EnhancedAnalyticsData } from '@/controllers/analyticsController';
import { useToast } from '@/contexts/ToastContext';

interface EnhancedAnalyticsProps {
  hubId?: string;
}

export default function EnhancedAnalytics({ hubId }: EnhancedAnalyticsProps) {
  const { showToast } = useToast();
  
  const [filters, setFilters] = useState<AnalyticsFilters>({
    hubId,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  
  const [activeView, setActiveView] = useState<'overview' | 'devices' | 'students' | 'content'>('overview');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch enhanced analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['enhanced-analytics', filters],
    queryFn: () => analyticsController.getEnhancedAnalytics(filters),
  });

  // Fetch device analytics
  const { data: deviceAnalytics } = useQuery({
    queryKey: ['device-analytics', hubId, filters],
    queryFn: () => analyticsController.getDeviceAnalytics(hubId, filters),
    enabled: activeView === 'devices',
  });

  // Fetch student analytics
  const { data: studentAnalytics } = useQuery({
    queryKey: ['student-analytics', hubId, filters],
    queryFn: () => analyticsController.getStudentAnalytics(hubId, filters),
    enabled: activeView === 'students',
  });

  // Fetch reading progress trends
  const { data: progressTrends } = useQuery({
    queryKey: ['progress-trends', filters],
    queryFn: () => analyticsController.getReadingProgressTrends(filters),
  });

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const blob = await analyticsController.exportAnalytics(format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('success', 'Export Complete', `Analytics data exported as ${format.toUpperCase()}`);
    } catch (error) {
      showToast('error', 'Export Failed', 'Failed to export analytics data');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const defaultData: EnhancedAnalyticsData = {
    overview: {
      totalSessions: 0,
      totalDevices: 0,
      totalStudents: 0,
      totalTimeSpent: 0,
      completionRate: 0,
      avgQuizScore: 0,
    },
    deviceAnalytics: [],
    studentAnalytics: [],
    contentPerformance: [],
    engagementTrends: [],
    hubAnalytics: [],
  };

  const data = analyticsData || defaultData;

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-end items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <h3 className="text-lg font-medium text-foreground mb-4">Analytics Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Grade</label>
                <select
                  value={filters.grade || ''}
                  onChange={(e) => setFilters({ ...filters, grade: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">All Grades</option>
                  {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => refetch()}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'devices', label: 'Devices', icon: DevicePhoneMobileIcon },
              { key: 'students', label: 'Students', icon: UserIcon },
              { key: 'content', label: 'Content', icon: BookOpenIcon },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeView === key
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{data.overview.totalSessions.toLocaleString()}</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Devices</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{data.overview.totalDevices.toLocaleString()}</p>
                </div>
                <DevicePhoneMobileIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{data.overview.totalStudents.toLocaleString()}</p>
                </div>
                <UserIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatDuration(data.overview.totalTimeSpent)}</p>
                </div>
                <ClockIcon className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{data.overview.completionRate.toFixed(1)}%</p>
                </div>
                <AcademicCapIcon className="h-8 w-8 text-indigo-500" />
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Quiz Score</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{data.overview.avgQuizScore.toFixed(1)}%</p>
                </div>
                <TrophyIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Content Performance */}
          <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Content Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Content</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Devices</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.contentPerformance.length > 0 ? (
                    data.contentPerformance.slice(0, 10).map((content, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground">{content.title}</div>
                          <div className="text-sm text-muted-foreground">{content.category}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{content.totalSessions}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{content.uniqueDevices || 0}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{content.uniqueStudents || 0}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{formatDuration(content.avgTimeSpent || 0)}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{(content.completionRate || 0).toFixed(1)}%</td>
                        <td className="px-6 py-4 text-sm text-foreground">{(content.avgQuizScore || 0).toFixed(1)}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        No content performance data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Devices Tab */}
      {activeView === 'devices' && (
        <div className="bg-card rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Device Analytics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sessions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deviceAnalytics && deviceAnalytics.length > 0 ? (
                  deviceAnalytics.map((device, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <DevicePhoneMobileIcon className="h-5 w-5 text-muted-foreground mr-3" />
                          <div>
                            <div className="text-sm font-medium text-foreground">{device.deviceCode}</div>
                            <div className="text-sm text-muted-foreground">Device ID: {device.deviceId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{device.totalSessions}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{formatDuration(device.totalTimeSpent)}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{device.completionRate.toFixed(1)}%</td>
                      <td className="px-6 py-4 text-sm text-foreground">{device.avgQuizScore.toFixed(1)}%</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(device.lastActivity)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No device analytics data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeView === 'students' && (
        <div className="bg-card rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Student Analytics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sessions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {studentAnalytics && studentAnalytics.length > 0 ? (
                  studentAnalytics.map((student, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-muted-foreground mr-3" />
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {student.firstName && student.lastName 
                                ? `${student.firstName} ${student.lastName}`
                                : student.studentCode
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">Code: {student.studentCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{student.grade ? `Grade ${student.grade}` : 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{student.totalSessions}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{formatDuration(student.totalTimeSpent)}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{student.contentCompleted}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{student.avgQuizScore.toFixed(1)}%</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(student.lastActivity)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No student analytics data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeView === 'content' && (
        <div className="space-y-6">
          {/* Reading Progress Trends */}
          <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Reading Progress Trends</h3>
            </div>
            <div className="p-6">
              {progressTrends && progressTrends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {progressTrends.map((trend, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 bg-muted/30">
                      <h4 className="font-semibold text-lg mb-2 text-foreground">{trend.period}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sessions:</span>
                          <span className="font-medium text-foreground">{trend.sessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completions:</span>
                          <span className="font-medium text-foreground">{trend.completions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Time:</span>
                          <span className="font-medium text-foreground">{formatDuration(trend.avgTime || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Score:</span>
                          <span className="font-medium text-foreground">{(trend.avgScore || 0).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No reading progress trends available
                </div>
              )}
            </div>
          </div>

          {/* Detailed Content Performance */}
          <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Detailed Content Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Content</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Unique Users</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.contentPerformance.length > 0 ? (
                    data.contentPerformance.map((content, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground">{content.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{content.description}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{content.category}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{content.language}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{content.totalSessions}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{content.uniqueUsers || 0}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{(content.completionRate || 0).toFixed(1)}%</td>
                        <td className="px-6 py-4 text-sm text-foreground">{(content.avgQuizScore || 0).toFixed(1)}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        No content performance data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}