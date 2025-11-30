import { apiClient } from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children: Category[];
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
}

export interface SearchCategoriesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface SearchCategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  totalPages: number;
}

export const categoriesController = {
  getAll: (): Promise<Category[]> => apiClient.get('/categories'),
  
  getTree: (): Promise<Category[]> => apiClient.get('/categories/tree'),
  
  create: (data: CreateCategoryData): Promise<Category> => 
    apiClient.post('/categories', data),
  
  update: (id: string, data: Partial<CreateCategoryData>): Promise<Category> => 
    apiClient.put(`/categories/${id}`, data),
  
  delete: (id: string): Promise<void> => 
    apiClient.delete(`/categories/${id}`),

  search: (params: SearchCategoriesParams): Promise<SearchCategoriesResponse> => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    return apiClient.get(`/categories/search?${searchParams.toString()}`);
  },
};