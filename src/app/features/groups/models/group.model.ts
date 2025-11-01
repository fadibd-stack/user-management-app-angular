export interface Group {
  id: number;
  name: string;
  description?: string;
  group_type: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  member_count?: number;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  is_lead: boolean;
  joined_date: string;
}

export interface GroupCreate {
  name: string;
  description?: string;
  group_type: string;
  is_active?: boolean;
}

export interface GroupUpdate {
  name?: string;
  description?: string;
  group_type?: string;
  is_active?: boolean;
}
