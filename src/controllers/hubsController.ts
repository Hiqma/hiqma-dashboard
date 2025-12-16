const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export const hubsController = {
  async getHubContent(hubId: string, filters?: { assigned?: boolean; search?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.assigned !== undefined) params.append('assigned', String(filters.assigned));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await fetch(`${API_BASE_URL}/edge-hubs/${hubId}/content?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return response.json();
  },

  async assignContent(hubId: string, contentId: string) {
    const response = await fetch(`${API_BASE_URL}/edge-hubs/${hubId}/content/${contentId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return response.json();
  },

  async unassignContent(hubId: string, contentId: string) {
    const response = await fetch(`${API_BASE_URL}/edge-hubs/${hubId}/content/${contentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return response.json();
  },
};
