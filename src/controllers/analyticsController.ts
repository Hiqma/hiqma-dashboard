import { apiClient } from './api';

export interface DashboardStats {
  totalContent: number;
  activeUsers: number;
  edgeHubs: number;
  completionRate: number;
}

export const analyticsController = {
  getEngagement: (): Promise<DashboardStats> => 
    apiClient.get('/analytics/engagement'),
  
  getAdvanced: (days?: number): Promise<any> => 
    apiClient.get(`/analytics/advanced${days ? `?days=${days}` : ''}`),
};