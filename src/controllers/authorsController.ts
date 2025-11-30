import { apiClient } from './api';

export interface Author {
  id: string;
  name: string;
  bio?: string;
  nationality?: string;
  birthYear?: number;
  isContributor: boolean;
  createdAt: string;
}

export interface CreateAuthorData {
  name: string;
  bio?: string;
  nationality?: string;
  birthYear?: number;
}

export interface AuthorStats {
  totalBooks: number;
  publishedWorks: number;
  yearsActive: number;
}

export interface SearchAuthorsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface SearchAuthorsResponse {
  data: Author[];
  total: number;
  page: number;
  totalPages: number;
}

export const authorsController = {
  getAll: (): Promise<Author[]> => apiClient.get('/authors'),
  
  create: (data: CreateAuthorData): Promise<Author> => 
    apiClient.post('/authors', data),
  
  update: (id: string, data: Partial<CreateAuthorData>): Promise<Author> => 
    apiClient.put(`/authors/${id}`, data),
  
  delete: (id: string): Promise<void> => 
    apiClient.delete(`/authors/${id}`),

  getStats: (id: string): Promise<AuthorStats> => 
    apiClient.get(`/authors/${id}/stats`),

  search: (params: SearchAuthorsParams): Promise<SearchAuthorsResponse> => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    return apiClient.get(`/authors/search?${searchParams.toString()}`);
  },
};