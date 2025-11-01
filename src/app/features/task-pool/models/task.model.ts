export interface TaskAssignment {
  id: number;
  test_case_id: number;
  test_case_title?: string;
  test_case_priority?: string;
  assignment_type: 'user' | 'team';
  user_id?: number;
  user_name?: string;
  group_id?: number;
  group_name?: string;
  status: string;
  claimed_date?: string;
  created_at: string;
}
