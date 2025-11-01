export interface Environment {
  id: number;
  name: string;
  description?: string;
  environment_type: string;
  is_active: boolean;
  created_at: string;
}
