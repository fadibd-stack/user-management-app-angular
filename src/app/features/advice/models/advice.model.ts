export interface Advice {
  id: number;
  test_case_id: number;
  test_case_title?: string;
  asked_by_id: number;
  asked_by_username?: string;
  asked_to_id: number;
  asked_to_username?: string;
  question_text: string;
  status: 'pending' | 'answered' | 'closed';
  resolution_summary?: string;
  created_at: string;
  answered_at?: string;
  closed_at?: string;
  messages: AdviceMessage[];
}

export interface AdviceMessage {
  id: number;
  advice_id: number;
  author_user_id: number;
  author_username?: string;
  body: string;
  created_at: string;
}
