interface Content {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  language: string;
  category: { id: string; name: string; };
  ageGroup: { id: string; name: string; };
  author: { id: string; name: string; };
  createdAt: string;
}

interface ContentResponse {
  data: Content[];
  total: number;
  page: number;
  totalPages: number;
}

interface SearchParams {
  search?: string;
  page?: number;
  limit?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const contentController = {
  async getPendingContent(params: SearchParams = {}): Promise<ContentResponse> {
    const { search, page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams();
    
    if (search) queryParams.append('search', search);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/content/pending?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending content');
    }

    return response.json();
  },

  async getAllContent(params: SearchParams = {}): Promise<ContentResponse> {
    const { search, page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams();
    
    if (search) queryParams.append('search', search);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/content?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }

    return response.json();
  },

  async updateContentStatus(id: string, status: 'verified' | 'rejected'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/content/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update content status');
    }
  },

  async getMyContent(): Promise<Content[]> {
    const response = await fetch(`${API_BASE_URL}/content/my-content`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch my content');
    }

    return response.json();
  },
};

export type { Content, ContentResponse, SearchParams };