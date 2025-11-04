export interface TestCase {
  id: number;
  title: string;
  description?: string;
  project_id?: number;
  project_name?: string;
  system_area_id?: number;
  system_area_name?: string;
  system_area_code?: string;
  priority: string;
  test_type: string;
  complexity: string;
  is_automatic_change: boolean;
  is_regulatory: boolean;
  expected_result?: string;
  test_notes?: string;
  created_by_id: number;
  created_by_name?: string;
  organization_id?: number;
  organization_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface TestCaseCreate {
  title: string;
  description?: string;
  project_id?: number;
  system_area_id?: number;
  status?: string;
  priority?: string;
  test_type?: string;
  complexity?: string;
  is_automatic_change?: boolean;
  is_regulatory?: boolean;
  expected_result?: string;
  due_date?: string;
  organization_id?: number;
}

export interface TestCaseUpdate {
  title?: string;
  description?: string;
  project_id?: number;
  system_area_id?: number;
  status?: string;
  priority?: string;
  test_type?: string;
  complexity?: string;
  is_automatic_change?: boolean;
  is_regulatory?: boolean;
  expected_result?: string;
  actual_result?: string;
  test_notes?: string;
  due_date?: string;
  completed_date?: string;
}

export interface SystemArea {
  id: number;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}
