const API_BASE_URL = 'http://localhost:3001';

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

export const usersController = {
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async changePassword(id: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    if (!response.ok) throw new Error('Failed to change password');
    return response.json();
  },

  async getUserProfile(id: string) {
    const response = await fetch(`${API_BASE_URL}/users/profile/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }
};