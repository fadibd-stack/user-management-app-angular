export interface MenuItem {
  id: number;
  label: string;
  path: string;
  icon?: string;
  section: string;
  parent_id?: number;
  order_index: number;
  description?: string;
  access_level?: string;  // 'all' or 'internal'
  created_at?: string;
  updated_at?: string;
}

export interface RoleMenuPermission {
  id: number;
  role_name: string;
  menu_item_id: number;
  can_view: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
}

export interface MenuPermissionMatrix {
  menu_item: MenuItem;
  permissions: { [role: string]: boolean };
}

export interface MenuSection {
  section: string;
  title: string;
  items: MenuItem[];
}

export interface RoleMenuPermissionCreate {
  role_name: string;
  menu_item_id: number;
  can_view: boolean;
}

export interface BulkPermissionUpdate {
  updates: RoleMenuPermissionCreate[];
}

export const EMPLOYEE_ROLES = [
  { name: 'is_standard', label: 'Standard' },
  { name: 'is_system_admin', label: 'System Admin' },
  { name: 'is_manager', label: 'Manager' },
  { name: 'is_product_manager', label: 'Product Manager' },
  { name: 'is_developer', label: 'Developer' }
] as const;

export const CONTACT_ROLES = [
  { name: 'CONTACT_ORG_ADMIN', label: 'Contact Admin' },
  { name: 'CONTACT_USER', label: 'Contact User' }
] as const;

export const ALL_ROLES = [...EMPLOYEE_ROLES, ...CONTACT_ROLES];
