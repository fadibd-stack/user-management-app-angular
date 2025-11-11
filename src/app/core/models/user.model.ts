export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  language: string;
  timezone: string;
  user_role: 'InterSystems' | 'Contractor' | 'Customer';
  phone_number?: string;
  job_title?: string;
  organization_id?: number;
  organization_name?: string;
  // User type determined by table (employee vs contact)
  user_type: 'employee' | 'contact';
  permission_level: 'read_only' | 'standard' | 'org_admin' | 'system_admin' | 'user';
  is_active: boolean;
  is_superuser: boolean;
  is_org_admin: boolean;
  // Employee roles (only applicable for employees, false for contacts)
  is_standard?: boolean;
  is_system_admin?: boolean;
  is_manager?: boolean;
  is_product_manager?: boolean;
  is_developer?: boolean;
  use_classic_menu?: boolean;
  auto_hide_menu?: boolean;
  // Global Features access control
  enable_search?: boolean;
  enable_genai?: boolean;
  created_at?: string;
  updated_at?: string;
  // JWT token (returned from login endpoint)
  access_token?: string;
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
