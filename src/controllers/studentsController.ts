const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export interface Student {
  id: string;
  hubId: string;
  studentCode: string;
  firstName?: string;
  lastName?: string;
  grade?: string;
  age?: number;
  metadata?: any;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentRequest {
  firstName?: string;
  lastName?: string;
  grade?: string;
  age?: number;
  metadata?: any;
}

export interface UpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  grade?: string;
  age?: number;
  metadata?: any;
  status?: 'active' | 'inactive';
}

export interface BulkImportStudentRequest {
  students: CreateStudentRequest[];
}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  totalPages: number;
}

export const studentsController = {
  async getHubStudents(hubId: string, filters?: { 
    status?: string; 
    search?: string; 
    grade?: string;
    page?: number; 
    limit?: number; 
  }): Promise<StudentListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.grade) params.append('grade', filters.grade);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/students?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.statusText}`);
    }

    return response.json();
  },

  async createStudent(hubId: string, data: CreateStudentRequest): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/students`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create student: ${response.statusText}`);
    }

    return response.json();
  },

  async updateStudent(studentId: string, data: UpdateStudentRequest): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update student: ${response.statusText}`);
    }

    return response.json();
  },

  async deactivateStudent(studentId: string): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to deactivate student: ${response.statusText}`);
    }

    return response.json();
  },

  async bulkImportStudents(hubId: string, data: BulkImportStudentRequest): Promise<Student[]> {
    const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/students/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to import students: ${response.statusText}`);
    }

    return response.json();
  },

  async exportStudents(hubId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/students/export`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export students: ${response.statusText}`);
    }

    return response.blob();
  },

  async getStudentStats(hubId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byGrade: Record<string, number>;
    averageAge?: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/students/stats`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch student stats: ${response.statusText}`);
    }

    return response.json();
  },

  async importFromCSV(hubId: string, file: File): Promise<Student[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/students/import-csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to import CSV: ${response.statusText}`);
    }

    return response.json();
  },
};