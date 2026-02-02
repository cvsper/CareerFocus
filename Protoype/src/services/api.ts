const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://wble-portal-api.onrender.com/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on init
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.detail || 'Login failed' };
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return { data };
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Dashboard
  async getStudentDashboard() {
    return this.request<StudentDashboard>('/dashboard/student');
  }

  async getAdminDashboard() {
    return this.request<AdminDashboard>('/dashboard/admin');
  }

  // Timesheets
  async getTimesheets(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<Timesheet[]>(`/timesheets/${query}`);
  }

  async getTimesheet(id: number) {
    return this.request<Timesheet>(`/timesheets/${id}`);
  }

  async createTimesheet(data: TimesheetCreate) {
    return this.request<Timesheet>('/timesheets/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitTimesheet(id: number, signature?: string) {
    return this.request<Timesheet>(`/timesheets/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    });
  }

  async downloadTimesheetPDF(id: number): Promise<{ data?: Blob; error?: string }> {
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/timesheets/${id}/pdf`, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error ${response.status}`);
      }

      const blob = await response.blob();
      return { data: blob };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getPendingTimesheets() {
    return this.request<Timesheet[]>('/timesheets/pending');
  }

  async reviewTimesheet(id: number, approved: boolean, rejectionReason?: string) {
    return this.request<Timesheet>(`/timesheets/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ approved, rejection_reason: rejectionReason }),
    });
  }

  // Programs
  async getPrograms() {
    return this.request<Program[]>('/programs/');
  }

  async getAvailablePrograms() {
    return this.request<Program[]>('/programs/available');
  }

  async getMyEnrollments() {
    return this.request<Enrollment[]>('/programs/enrollments/my');
  }

  async getCurrentEnrollment() {
    return this.request<Enrollment>('/programs/enrollments/current');
  }

  async enrollInProgram(programId: number) {
    return this.request<Enrollment>(`/programs/${programId}/enroll`, {
      method: 'POST',
    });
  }

  // Admin Program Management
  async getAllProgramsAdmin() {
    return this.request<Program[]>('/programs/admin/all');
  }

  async createProgram(data: ProgramCreate) {
    return this.request<Program>('/programs/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProgram(id: number, data: ProgramUpdate) {
    return this.request<Program>(`/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProgram(id: number) {
    return this.request<{ message: string }>(`/programs/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents
  async getDocuments(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<Document[]>(`/documents/${query}`);
  }

  async uploadDocument(data: DocumentCreate) {
    return this.request<Document>('/documents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingDocuments() {
    return this.request<Document[]>('/documents/pending');
  }

  async reviewDocument(id: number, approved: boolean, rejectionReason?: string) {
    return this.request<Document>(`/documents/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ approved, rejection_reason: rejectionReason }),
    });
  }

  // Opportunities
  async getOpportunities(type?: string) {
    const query = type ? `?opportunity_type=${type}` : '';
    return this.request<Opportunity[]>(`/opportunities/${query}`);
  }

  async getFeaturedOpportunities() {
    return this.request<Opportunity[]>('/opportunities/featured');
  }

  // Admin Opportunity Management
  async getAllOpportunitiesAdmin() {
    return this.request<Opportunity[]>('/opportunities/admin/all');
  }

  async createOpportunity(data: OpportunityCreate) {
    return this.request<Opportunity>('/opportunities/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOpportunity(id: number, data: OpportunityUpdate) {
    return this.request<Opportunity>(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOpportunity(id: number) {
    return this.request<{ message: string }>(`/opportunities/${id}`, {
      method: 'DELETE',
    });
  }

  // Learning
  async getLearningProgress() {
    return this.request<LearningProgress[]>('/learning/progress');
  }

  async updateLessonProgress(lessonId: number, completed: boolean) {
    return this.request<LearningProgress>(`/learning/progress/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify({ completed }),
    });
  }

  async getAnnouncements() {
    return this.request<Announcement[]>('/learning/announcements');
  }

  // Users
  async updateProfile(data: UserUpdate) {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getStudents() {
    return this.request<User[]>('/users/students');
  }
}

// Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  role: 'student' | 'admin';
  is_active: boolean;
  created_at: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  case_id?: string;
  job_title?: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  case_id?: string;
  job_title?: string;
}

export interface StudentDashboard {
  student_name: string;
  program_name?: string;
  program_status?: string;
  total_hours: number;
  current_pay_period_start?: string;
  current_pay_period_end?: string;
  timesheet_status: string;
  pending_documents: number;
  completed_lessons: number;
  total_lessons: number;
}

export interface AdminDashboard {
  total_students: number;
  active_students: number;
  pending_timesheets: number;
  pending_documents: number;
  total_hours_pending: number;
}

export interface Timesheet {
  id: number;
  student_id: number;
  week_start: string;
  week_end: string;
  total_hours: number;
  notes?: string;
  status: string;
  submitted_at?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  entries: TimesheetEntry[];
  created_at: string;
  signature?: string;
  signature_date?: string;
}

export interface TimesheetEntry {
  id: number;
  date: string;
  start_time?: string;
  end_time?: string;
  lunch_out?: string;
  lunch_in?: string;
  break_minutes: number;
  hours: number;
}

export interface TimesheetCreate {
  week_start: string;
  week_end: string;
  notes?: string;
  entries: {
    date: string;
    start_time?: string;
    end_time?: string;
    lunch_out?: string;
    lunch_in?: string;
    break_minutes: number;
    hours: number;
  }[];
}

export interface Program {
  id: number;
  name: string;
  description?: string;
  organization: string;
  location?: string;
  start_date: string;
  end_date: string;
  total_hours: number;
  spots_available: number;
  application_deadline?: string;
  status: string;
  created_at: string;
}

export interface ProgramCreate {
  name: string;
  description?: string;
  organization: string;
  location?: string;
  start_date: string;
  end_date: string;
  total_hours: number;
  spots_available: number;
  application_deadline?: string;
}

export interface ProgramUpdate {
  name?: string;
  description?: string;
  organization?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  total_hours?: number;
  spots_available?: number;
  application_deadline?: string;
  status?: string;
}

export interface Enrollment {
  id: number;
  student_id: number;
  program_id: number;
  status: string;
  hours_completed: number;
  supervisor_name?: string;
  enrolled_at: string;
  completed_at?: string;
  program: Program;
}

export interface Document {
  id: number;
  student_id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  status: string;
  uploaded_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export interface DocumentCreate {
  document_type: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
}

export interface Opportunity {
  id: number;
  title: string;
  organization: string;
  location?: string;
  opportunity_type: string;
  description?: string;
  requirements?: string;
  duration?: string;
  hours_per_week?: string;
  compensation?: string;
  application_deadline?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface OpportunityCreate {
  title: string;
  organization: string;
  location?: string;
  opportunity_type: string;
  description?: string;
  requirements?: string;
  duration?: string;
  hours_per_week?: string;
  compensation?: string;
  application_deadline?: string;
  is_featured?: boolean;
}

export interface OpportunityUpdate {
  title?: string;
  organization?: string;
  location?: string;
  opportunity_type?: string;
  description?: string;
  requirements?: string;
  duration?: string;
  hours_per_week?: string;
  compensation?: string;
  application_deadline?: string;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface LearningProgress {
  id: number;
  student_id: number;
  lesson_id: number;
  completed: boolean;
  completed_at?: string;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  announcement_type: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

// Export singleton instance
export const api = new ApiService();
