const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to safely get auth token
const getAuthToken = (): string => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot access localStorage on server side');
  }
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No auth token found');
  }
  return token;
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  institution?: string;
  expertise?: string;
  country: string;
  continent: string;
  createdAt: string;
}

export interface Contributor {
  id: string;
  name: string;
  email: string;
}

export const usersController = {
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getContributors(): Promise<Contributor[]> {
    const response = await fetch(`${API_BASE_URL}/users/contributors`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch contributors');
    return response.json();
  },

  async changePassword(id: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    if (!response.ok) throw new Error('Failed to change password');
    return response.json();
  },

  async getUserProfile(id: string) {
    const response = await fetch(`${API_BASE_URL}/users/profile/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }
};