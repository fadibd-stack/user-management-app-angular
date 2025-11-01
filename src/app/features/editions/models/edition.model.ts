export interface Edition {
  id: number;
  code: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}
