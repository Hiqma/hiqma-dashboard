import { apiClient } from './api';

export interface Application {
  id: string;
  name: string;
  email: string;
  institution: string;
  expertise: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export const contributorsController = {
  getApplications: (): Promise<Application[]> => 
    apiClient.get('/contributors/applications'),
  
  reviewApplication: (id: string, status: 'approved' | 'rejected', reviewerId: string): Promise<Application> => 
    apiClient.put(`/contributors/applications/${id}/review`, { status, reviewerId }),
};