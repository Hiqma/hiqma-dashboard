const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export interface Device {
  id: string;
  hubId: string;
  deviceCode: string;
  name: string;
  status: 'active' | 'inactive' | 'registered';
  registeredAt?: string;
  lastSeen?: string;
  deviceInfo?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDevicesRequest {
  count: number;
}

export interface DeviceListResponse {
  devices: Device[];
  total: number;
  page: number;
  totalPages: number;
}

export const devicesController = {
  async getHubDevices(hubId: string, filters?: { 
    status?: string; 
    search?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<DeviceListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await fetch(`${API_BASE_URL}/devices/hubs/${hubId}/devices?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch devices: ${response.statusText}`);
    }

    return response.json();
  },

  async createDevices(hubId: string, data: CreateDevicesRequest): Promise<Device[]> {
    const response = await fetch(`${API_BASE_URL}/devices/hubs/${hubId}/devices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceCount: data.count }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create devices: ${response.statusText}`);
    }

    return response.json();
  },

  async regenerateDeviceCode(deviceId: string): Promise<Device> {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/regenerate`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to regenerate device code: ${response.statusText}`);
    }

    return response.json();
  },

  async deleteDevice(deviceId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete device: ${response.statusText}`);
    }
  },

  async exportDeviceCodes(hubId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/devices/hubs/${hubId}/devices/export`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export device codes: ${response.statusText}`);
    }

    return response.blob();
  },

  async getDeviceStats(hubId: string): Promise<{
    total: number;
    active: number;
    registered: number;
    inactive: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/devices/stats`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch device stats: ${response.statusText}`);
    }

    return response.json();
  },
};