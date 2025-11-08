import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MenuItem,
  MenuSection,
  MenuPermissionMatrix,
  RoleMenuPermission,
  RoleMenuPermissionCreate,
  BulkPermissionUpdate
} from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  /**
   * Get all menu items
   */
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/api/menu-items`);
  }

  /**
   * Get menu items grouped by section
   */
  getMenuItemsBySection(): Observable<MenuSection[]> {
    return this.http.get<MenuSection[]>(`${this.apiUrl}/api/menu-items/by-section`);
  }

  /**
   * Get all role-menu permissions
   */
  getRoleMenuPermissions(roleName?: string): Observable<RoleMenuPermission[]> {
    const url = `${this.apiUrl}/api/role-menu-permissions`;
    // TypeScript has trouble with conditional params, so always call without params for now
    // TODO: Fix this to support role filtering
    return this.http.get<RoleMenuPermission[]>(url);
  }

  /**
   * Get the complete permission matrix for the configuration UI
   */
  getMenuPermissionMatrix(): Observable<MenuPermissionMatrix[]> {
    return this.http.get<MenuPermissionMatrix[]>(`${this.apiUrl}/api/menu-permission-matrix`);
  }

  /**
   * Create or update a single role-menu permission
   */
  createOrUpdatePermission(permission: RoleMenuPermissionCreate): Observable<RoleMenuPermission> {
    return this.http.post<RoleMenuPermission>(`${this.apiUrl}/api/role-menu-permissions`, permission);
  }

  /**
   * Bulk update multiple permissions at once
   */
  bulkUpdatePermissions(bulkUpdate: BulkPermissionUpdate): Observable<{ created: number; updated: number; total: number }> {
    return this.http.post<{ created: number; updated: number; total: number }>(
      `${this.apiUrl}/api/role-menu-permissions/bulk`,
      bulkUpdate
    );
  }

  /**
   * Get menus for the current authenticated user
   * This returns only the menus the user is allowed to see based on their roles
   */
  getMenusForCurrentUser(): Observable<MenuSection[]> {
    return this.http.get<MenuSection[]>(`${this.apiUrl}/api/menus/for-user`);
  }

  /**
   * Check if the current user has access to a specific route
   */
  hasRouteAccess(route: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/api/check-route-access`, { route });
  }
}
