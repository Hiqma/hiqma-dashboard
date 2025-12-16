import { apiClient } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export interface DashboardStats {
  totalContent: number;
  activeUsers: number;
  edgeHubs: number;
  completionRate: number;
}

export interface DeviceAnalytics {
  deviceId: string;
  deviceCode: string;
  totalSessions: number;
  totalTimeSpent: number;
  completionRate: number;
  avgQuizScore: number;
  lastActivity: string;
}

export interface StudentAnalytics {
  studentId: string;
  studentCode: string;
  firstName?: string;
  lastName?: string;
  grade?: string;
  totalSessions: number;
  totalTimeSpent: number;
  completionRate: number;
  avgQuizScore: number;
  contentCompleted: number;
  lastActivity: string;
}

export interface AnalyticsFilters {
  hubId?: string;
  deviceId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  contentId?: string;
  grade?: string;
}

export interface EnhancedAnalyticsData {
  overview: {
    totalSessions: number;
    totalDevices: number;
    totalStudents: number;
    totalTimeSpent: number;
    completionRate: number;
    avgQuizScore: number;
  };
  deviceAnalytics: DeviceAnalytics[];
  studentAnalytics: StudentAnalytics[];
  contentPerformance: any[];
  engagementTrends: any[];
  hubAnalytics: any[];
}

export const analyticsController = {
  getEngagement: (): Promise<DashboardStats> => 
    apiClient.get('/analytics/engagement'),
  
  getAdvanced: (days?: number): Promise<any> => 
    apiClient.get(`/analytics/advanced${days ? `?days=${days}` : ''}`),

  async getEnhancedAnalytics(filters?: AnalyticsFilters): Promise<EnhancedAnalyticsData> {
    const params = new URLSearchParams();
    if (filters?.hubId) params.append('hubId', filters.hubId);
    if (filters?.deviceId) params.append('deviceId', filters.deviceId);
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.contentId) params.append('contentId', filters.contentId);
    if (filters?.grade) params.append('grade', filters.grade);

    const response = await fetch(`${API_BASE_URL}/analytics/enhanced?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch enhanced analytics: ${response.statusText}`);
    }

    return response.json();
  },

  async getDeviceAnalytics(hubId: string, filters?: AnalyticsFilters): Promise<DeviceAnalytics[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.contentId) params.append('contentId', filters.contentId);

    const response = await fetch(`${API_BASE_URL}/devices/${hubId}/analytics?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch device analytics: ${response.statusText}`);
    }

    return response.json();
  },

  async getStudentAnalytics(hubId: string, filters?: AnalyticsFilters): Promise<StudentAnalytics[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.contentId) params.append('contentId', filters.contentId);
    if (filters?.grade) params.append('grade', filters.grade);

    const response = await fetch(`${API_BASE_URL}/students/${hubId}/analytics?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch student analytics: ${response.statusText}`);
    }

    return response.json();
  },

  async exportAnalytics(format: 'csv' | 'json', filters?: AnalyticsFilters): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters?.hubId) params.append('hubId', filters.hubId);
    if (filters?.deviceId) params.append('deviceId', filters.deviceId);
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.contentId) params.append('contentId', filters.contentId);
    if (filters?.grade) params.append('grade', filters.grade);

    const response = await fetch(`${API_BASE_URL}/analytics/export?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export analytics: ${response.statusText}`);
    }

    return response.blob();
  },

  async getReadingProgressTrends(filters?: AnalyticsFilters): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.hubId) params.append('hubId', filters.hubId);
    if (filters?.deviceId) params.append('deviceId', filters.deviceId);
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.grade) params.append('grade', filters.grade);

    const response = await fetch(`${API_BASE_URL}/analytics/reading-progress-trends?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reading progress trends: ${response.statusText}`);
    }

    return response.json();
  },

  async getEngagementMetrics(filters?: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.hubId) params.append('hubId', filters.hubId);
    if (filters?.deviceId) params.append('deviceId', filters.deviceId);
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.grade) params.append('grade', filters.grade);

    const response = await fetch(`${API_BASE_URL}/analytics/engagement-metrics?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch engagement metrics: ${response.statusText}`);
    }

    return response.json();
  },
};