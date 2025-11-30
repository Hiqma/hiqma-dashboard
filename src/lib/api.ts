import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
};

export const contentApi = {
  getAll: () => api.get('/content'),
  getPending: () => api.get('/content/pending'),
  updateStatus: (id: string, status: 'verified' | 'rejected') =>
    api.put(`/content/${id}/status`, { status }),
  submit: (data: any) => api.post('/content/submit', data),
};

export const analyticsApi = {
  getEngagement: () => api.get('/analytics/engagement'),
  getContentPopularity: () => api.get('/analytics/content-popularity'),
};

export const authorsApi = {
  getAll: () => api.get('/authors'),
  create: (data: any) => api.post('/authors', data),
};

export const contributorsApi = {
  apply: (data: any) => api.post('/contributors/apply', data),
  getApplications: () => api.get('/contributors/applications'),
  reviewApplication: (id: string, data: any) => api.put(`/contributors/applications/${id}/review`, data),
};

export const countriesApi = {
  getAll: () => api.get('/countries'),
  seed: () => api.post('/countries/seed'),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

export const ageGroupsApi = {
  getAll: () => api.get('/age-groups'),
  seed: () => api.post('/age-groups/seed'),
};

export const categoriesApiExtended = {
  ...categoriesApi,
  seed: () => api.post('/categories/seed'),
};

// Update contentApi to include new endpoints
export const contentApiExtended = {
  ...contentApi,
  getMyContent: () => api.get('/content/my-content'),
  getByCountry: (country: string) => api.get(`/content?country=${country}`),
};

export default api;