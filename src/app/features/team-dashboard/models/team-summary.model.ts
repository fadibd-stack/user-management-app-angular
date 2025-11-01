export interface TeamSummary {
  range_start: string;
  range_end: string;
  work_items: {
    in_pool: number;
    claimed: number;
    completed: number;
  };
  tasks_by_type: {
    BUILD: number;
    TESTING: number;
    TRAINING: number;
  };
  overdue: number;
  due_soon: number;
  owner_load: OwnerLoad[];
}

export interface OwnerLoad {
  user_id: number;
  username: string;
  full_name: string;
  claimed_count: number;
}
