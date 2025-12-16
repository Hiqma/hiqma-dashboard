const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const authController = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  async getCurrentUser() {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      throw new Error('getCurrentUser can only be called in the browser');
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No auth token found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Auth API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: `${API_BASE_URL}/auth/me`
        });
        
        if (response.status === 401) {
          // Token is invalid or expired, remove it
          localStorage.removeItem('authToken');
          throw new Error('Authentication token expired. Please log in again.');
        }
        
        throw new Error(`Failed to get current user: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to API server at ${API_BASE_URL}. Please ensure the API is running.`);
      }
      throw error;
    }
  }
};