export interface TestExecution {
  id: number;
  test_case_id: number;
  test_case_title?: string;
  executed_by_id: number;
  executed_by_name?: string;
  execution_date: string;
  status: string;
  actual_result?: string;
  execution_notes?: string;
  duration_minutes?: number;
  version?: string;
  environment?: string;
  build_number?: string;
  attachments?: string;
  created_at: string;
  updated_at?: string;
}

export interface TestExecutionCreate {
  test_case_id: number;
  execution_date?: string;
  status: string;
  actual_result?: string;
  execution_notes?: string;
  duration_minutes?: number;
  version?: string;
  environment?: string;
  build_number?: string;
}

export interface TestExecutionUpdate {
  status?: string;
  actual_result?: string;
  execution_notes?: string;
  duration_minutes?: number;
  version?: string;
  environment?: string;
  build_number?: string;
}
