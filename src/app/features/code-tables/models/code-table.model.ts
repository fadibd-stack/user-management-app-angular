export interface CodeTableType {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CodeTableValue {
  id: number;
  table_type_id: number;
  table_type_code?: string;
  table_type_name?: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CodeTableValueCreate {
  table_type_id: number;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order?: number;
  is_default?: boolean;
  is_active?: boolean;
}

export interface CodeTableValueUpdate {
  code?: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order?: number;
  is_default?: boolean;
  is_active?: boolean;
}
