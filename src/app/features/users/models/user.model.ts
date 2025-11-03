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
  use_classic_menu?: boolean;
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
  phone_number?: string;
  job_title?: string;
  organization_id?: number;
  employment_type: 'intersystems' | 'customer';
  permission_level: 'read_only' | 'standard' | 'org_admin' | 'system_admin' | 'user';
  is_active?: boolean;
  use_classic_menu?: boolean;
}

export interface UserUpdate {
  password?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  language?: string;
  timezone?: string;
  phone_number?: string;
  job_title?: string;
  organization_id?: number;
  employment_type?: 'intersystems' | 'customer';
  permission_level?: 'read_only' | 'standard' | 'org_admin' | 'system_admin' | 'user';
  is_active?: boolean;
  use_classic_menu?: boolean;
}
