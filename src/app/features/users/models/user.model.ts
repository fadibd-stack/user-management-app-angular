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
  // Global Features access control
  enable_search?: boolean;
  enable_genai?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreate {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  language: string;
  timezone: string;
  user_role: 'InterSystems' | 'Contractor' | 'Customer';
  phone_number?: string;
  job_title?: string;
  organization_id?: number;
  user_type: 'employee' | 'contact';
  permission_level: 'read_only' | 'standard' | 'org_admin' | 'system_admin' | 'user';
  // Employee roles (only sent for employees)
  is_standard?: boolean;
  is_system_admin?: boolean;
  is_manager?: boolean;
  is_product_manager?: boolean;
  is_developer?: boolean;
  is_active?: boolean;
  use_classic_menu?: boolean;
  // Global Features access control
  enable_search?: boolean;
  enable_genai?: boolean;
}

export interface UserUpdate {
  password?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  language?: string;
  timezone?: string;
  user_role?: 'InterSystems' | 'Contractor' | 'Customer';
  phone_number?: string;
  job_title?: string;
  organization_id?: number;
  user_type?: 'employee' | 'contact';
  permission_level?: 'read_only' | 'standard' | 'org_admin' | 'system_admin' | 'user';
  // Employee roles (only sent for employees)
  is_standard?: boolean;
  is_system_admin?: boolean;
  is_manager?: boolean;
  is_product_manager?: boolean;
  is_developer?: boolean;
  is_active?: boolean;
  use_classic_menu?: boolean;
  // Global Features access control
  enable_search?: boolean;
  enable_genai?: boolean;
}
