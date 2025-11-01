export interface TeamDiscussion {
  id: number;
  test_case_id: number;
  test_case_title?: string;
  team1_id: number;
  team1_name?: string;
  team2_id: number;
  team2_name?: string;
  discussion_notes?: string;
  scheduled_date?: string;
  completed_date?: string;
  status: string;
  resolution?: string;
  resolution_summary?: string;
  created_at: string;
}
