export interface SystemArea {
  id: number;
  name: string;
  code: string;
  description?: string;
  display_order: number;
}

export interface TestCaseStats {
  total: number;
  new: number;
  in_progress: number;
  completed: number;
  blocked: number;
  failed: number;
}
