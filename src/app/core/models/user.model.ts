export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  language: string;
  timezone: string;
  phone_number?: string;
  job_title?: string;
  organization_id?: number;
  organization_name?: string;
  employment_type: 'intersystems' | 'customer';
  permission_level: 'read_only' | 'standard' | 'org_admin' | 'system_admin' | 'user';
  is_active: boolean;
  is_superuser: boolean;
  is_org_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
