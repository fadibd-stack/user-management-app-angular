export interface Project {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  target_date?: string;
  close_date?: string;
  status: string;
  is_current: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  start_date?: string;
  target_date?: string;
  status?: string;
  is_current?: boolean;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  start_date?: string;
  target_date?: string;
  close_date?: string;
  status?: string;
  is_current?: boolean;
}
