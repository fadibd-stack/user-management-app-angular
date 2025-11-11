import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MenuService } from '../../core/services/menu.service';
import { AuthService } from '../../core/services/auth.service';
import { PasswordConfirmationDialogComponent } from './password-confirmation-dialog.component';
import {
  MenuPermissionMatrix,
  RoleMenuPermissionCreate,
  BulkPermissionUpdate,
  ALL_ROLES
} from '../../core/models/menu.model';

@Component({
  selector: 'app-menu-config',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <div class="menu-config-container">
      <div class="header">
        <h1>Menu Configuration</h1>
        <p class="subtitle">Configure which menus each role can access (employee and contact roles)</p>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading menu configuration...</p>
      </div>

      <div *ngIf="!loading && matrixData.length > 0" class="config-content">
        <!-- Action Buttons -->
        <div class="action-bar">
          <button mat-raised-button color="primary" (click)="saveChanges()" [disabled]="saving || !hasChanges">
            <mat-icon>save</mat-icon>
            Save Changes
            <span *ngIf="hasChanges" class="change-badge">({{ changeCount }})</span>
          </button>

          <button mat-button (click)="resetChanges()" [disabled]="!hasChanges">
            <mat-icon>refresh</mat-icon>
            Reset
          </button>

          <span class="spacer"></span>

          <div class="info-text">
            <mat-icon>info</mat-icon>
            {{ matrixData.length }} menu items configured
          </div>
        </div>

        <!-- Role Group Headers -->
        <div class="role-group-headers">
          <div class="menu-title-spacer"></div>
          <div class="role-groups">
            <div class="role-group employee-group">
              <span class="group-label">Employee Roles</span>
            </div>
            <div class="role-group-divider"></div>
            <div class="role-group contact-group">
              <span class="group-label">Organization Roles</span>
            </div>
          </div>
        </div>

        <!-- Permission Matrix by Section -->
        <div class="sections-container">
          <mat-card *ngFor="let section of sections" class="section-card">
            <div class="section-header-row" (click)="toggleSection(section.key)">
              <div class="section-title">
                <mat-icon class="expand-icon">{{ isSectionExpanded(section.key) ? 'expand_more' : 'chevron_right' }}</mat-icon>
                <mat-icon>{{ getSectionIcon(section.key) }}</mat-icon>
                <h3>{{ section.label }}</h3>
                <span class="item-count">{{ section.items.length }} items</span>
              </div>
              <div class="section-controls" (click)="$event.stopPropagation()">
                <div class="role-select-all" *ngFor="let role of roles" [ngClass]="{'contact-role': isContactRole(role.name)}">
                  <mat-checkbox
                    [checked]="isSectionFullyChecked(section.key, role.name)"
                    [indeterminate]="isSectionPartiallyChecked(section.key, role.name)"
                    (change)="toggleSectionPermission(section.key, role.name, $event.checked)"
                    [disabled]="section.items.length > 0 && isContactRoleDisabled(section.items[0].menu_item, role.name)"
                    [color]="'primary'"
                    class="section-checkbox">
                  </mat-checkbox>
                  <span class="role-label-small">{{ role.label }}</span>
                </div>
              </div>
            </div>

            <div class="menu-items-list" *ngIf="isSectionExpanded(section.key)">
              <div *ngFor="let item of section.items"
                   class="menu-item-row"
                   [class.changed-row]="isRowChanged(item.menu_item.id)">
                <div class="menu-info">
                  <mat-icon class="menu-icon">{{ item.menu_item.icon || 'label' }}</mat-icon>
                  <div class="access-level-control">
                    <mat-select
                      [(value)]="item.menu_item.access_level"
                      (selectionChange)="onAccessLevelChange(item.menu_item.id, $event.value)"
                      class="access-level-select"
                      [matTooltip]="item.menu_item.access_level === 'internal_only' ? 'Internal Only - Not available to contact users' : 'All Users - Available to both employees and contacts'">
                      <mat-select-trigger>
                        <div class="access-level-trigger">
                          <mat-icon
                            class="access-icon"
                            [ngClass]="{'internal-icon': item.menu_item.access_level === 'internal_only', 'all-users-icon': item.menu_item.access_level === 'customer_facing'}">
                            {{ item.menu_item.access_level === 'internal_only' ? 'business' : 'public' }}
                          </mat-icon>
                          <span class="access-label">{{ item.menu_item.access_level === 'internal_only' ? 'Internal' : 'All Users' }}</span>
                        </div>
                      </mat-select-trigger>
                      <mat-option value="customer_facing">All Users</mat-option>
                      <mat-option value="internal_only">Internal Only</mat-option>
                    </mat-select>
                  </div>
                  <div class="menu-details">
                    <span class="menu-label">{{ item.menu_item.label }}</span>
                    <span class="menu-path">{{ item.menu_item.path }}</span>
                  </div>
                </div>
                <div class="menu-permissions">
                  <ng-container *ngFor="let role of roles">
                    <mat-checkbox *ngIf="!isContactRoleDisabled(item.menu_item, role.name)"
                      [checked]="item.permissions[role.name]"
                      (change)="togglePermission(item.menu_item.id, role.name, $event.checked)"
                      [color]="'primary'"
                      class="role-checkbox"
                      [ngClass]="{'contact-role': isContactRole(role.name)}">
                    </mat-checkbox>
                    <div *ngIf="isContactRoleDisabled(item.menu_item, role.name)"
                         class="disabled-indicator contact-role"
                         [matTooltip]="'Internal Only - Not available to organization users'">
                      <mat-icon class="disabled-icon">close</mat-icon>
                    </div>
                  </ng-container>
                </div>
              </div>
            </div>
          </mat-card>
        </div>
      </div>

      <div *ngIf="!loading && matrixData.length === 0" class="empty-state">
        <mat-icon>menu_open</mat-icon>
        <p>No menu items found</p>
      </div>
    </div>
  `,
  styles: [`
    .menu-config-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 500;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .action-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding: 12px 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .spacer {
      flex: 1;
    }

    .change-badge {
      margin-left: 4px;
      font-weight: bold;
    }

    .info-text {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
      font-size: 14px;
    }

    .info-text mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Role Group Headers */
    .role-group-headers {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      padding: 16px 24px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .menu-title-spacer {
      flex: 0 0 320px;
    }

    .role-groups {
      display: flex;
      align-items: center;
      gap: 0;
      flex: 1;
    }

    .role-group {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
    }

    .employee-group {
      flex: 1;
    }

    .contact-group {
      flex: 0 0 160px;
    }

    .role-group-divider {
      width: 3px;
      height: 40px;
      background: #333;
      border-radius: 2px;
      margin: 0 10px;
    }

    .group-label {
      font-weight: 600;
      font-size: 14px;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Section-based layout */
    .sections-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .section-card {
      padding: 0;
      overflow: hidden;
    }

    .section-header-row {
      background: #f5f5f5;
      color: #333;
      padding: 10px 16px;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
      border-bottom: 1px solid #e0e0e0;
    }

    .section-header-row:hover {
      background: #eeeeee;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .expand-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      transition: transform 0.2s;
    }

    .section-title mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .section-title h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .section-controls {
      display: grid;
      grid-template-columns: repeat(7, 100px);
      gap: 0;
      align-items: center;
    }

    .item-count {
      font-size: 11px;
      opacity: 0.85;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 10px;
    }

    .role-select-all {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      gap: 4px;
      padding: 8px 0;
      margin: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.3);
      box-sizing: border-box;
    }

    .role-select-all:last-child {
      border-right: none;
    }

    .role-select-all.contact-role {
      background-color: rgba(0, 0, 0, 0.03);
    }

    .role-select-all.contact-role:first-of-type {
      border-left: 2px solid #999;
      margin-left: 20px;
      position: relative;
    }

    .role-select-all.contact-role:first-of-type::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #ddd;
    }

    .role-label-small {
      font-size: 11px;
      font-weight: 500;
      opacity: 0.95;
      text-align: center;
      width: 100%;
    }

    .section-checkbox {
      transform: scale(0.9);
      margin: 0;
    }

    /* Menu items list */
    .menu-items-list {
      padding: 8px;
    }

    .menu-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;
    }

    .menu-item-row:hover {
      background-color: #fafafa;
    }

    .menu-item-row:last-child {
      border-bottom: none;
    }

    .menu-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .menu-icon {
      color: #666;
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .menu-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .menu-label {
      font-weight: 500;
      font-size: 14px;
      color: #333;
    }

    .menu-path {
      font-size: 12px;
      color: #999;
      font-family: monospace;
    }

    .access-level-control {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      margin-right: 12px;
    }

    .access-level-select {
      width: 70px;
    }

    .access-level-trigger {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .access-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .internal-icon {
      color: #ff9800;
    }

    .all-users-icon {
      color: #4caf50;
    }

    .access-label {
      font-size: 9px;
      line-height: 1;
      white-space: nowrap;
      color: #666;
    }

    /* Make the dropdown panel wider while keeping trigger compact */
    ::ng-deep .mat-mdc-select-panel {
      min-width: 150px !important;
    }

    ::ng-deep .mat-mdc-option {
      font-size: 14px !important;
    }

    .menu-permissions {
      display: grid;
      grid-template-columns: repeat(7, 100px);
      gap: 0;
      align-items: center;
    }

    .role-checkbox {
      margin: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      border-right: 1px solid #e0e0e0;
      box-sizing: border-box;
    }

    /* Ensure Material checkbox doesn't add extra spacing */
    .role-checkbox ::ng-deep .mdc-checkbox {
      margin: 0 !important;
      padding: 0 !important;
    }

    .role-checkbox ::ng-deep .mdc-form-field {
      margin: 0 !important;
      padding: 0 !important;
    }

    .role-checkbox ::ng-deep .mat-mdc-checkbox {
      margin: 0 !important;
      padding: 0 !important;
    }

    .role-checkbox ::ng-deep .mat-mdc-checkbox-touch-target {
      display: none !important;
    }

    .role-checkbox:last-child {
      border-right: none;
    }

    .role-checkbox.contact-role {
      background-color: rgba(0, 0, 0, 0.02);
    }

    /* Hide right border on last employee role checkbox before contact roles */
    .role-checkbox:not(.contact-role):last-of-type {
      border-right: none;
    }

    .role-checkbox.contact-role:first-of-type {
      /* border-left: 2px solid #999; */
      margin-left: 10px;
    }

    .disabled-indicator {
      margin: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      border-right: 1px solid #e0e0e0;
      background-color: rgba(0, 0, 0, 0.02);
      cursor: not-allowed;
      box-sizing: border-box;
      position: relative;
    }

    .disabled-indicator .disabled-icon {
      margin-top: -2px;
    }

    .disabled-indicator.contact-role:first-of-type {
      /* border-left: 2px solid #999; */
      margin-left: 10px;
    }

    .disabled-indicator:last-child {
      border-right: none;
    }

    .disabled-icon {
      color: #d32f2f;
      font-size: 18px;
      width: 18px;
      height: 18px;
      display: block;
      line-height: 18px;
    }

    .changed-row {
      background-color: #fff9e6 !important;
      border-left: 3px solid #ff9800;
    }

    .changed-row:hover {
      background-color: #fff3cd !important;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

  `]
})
export class MenuConfigComponent implements OnInit {
  matrixData: MenuPermissionMatrix[] = [];
  sections: any[] = [];
  roles = ALL_ROLES;

  loading = false;
  saving = false;
  hasChanges = false;
  changeCount = 0;

  private expandedSections: Set<string> = new Set(['MAIN']); // Start with MAIN section expanded

  private sectionLabels: { [key: string]: string } = {
    'MAIN': 'Main Navigation',
    'RELEASE_VALIDATION': 'Release Validation',
    'SYSTEM_CONFIGURATION': 'System Configuration',
    'ORGANIZATION': 'Organization Management',
    'GLOBAL FEATURES': 'Global Features',
    'ADDITIONAL': 'Additional Features'
  };

  private originalPermissions: Map<string, boolean> = new Map();
  private changedPermissions: Map<string, RoleMenuPermissionCreate> = new Map();
  private originalAccessLevels: Map<number, string> = new Map();

  constructor(
    private menuService: MenuService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPermissionMatrix();
  }

  loadPermissionMatrix() {
    this.loading = true;
    this.menuService.getMenuPermissionMatrix().subscribe({
      next: (data) => {
        console.log('Menu Permission Matrix Data:', data);
        console.log('Data length:', data?.length);
        this.matrixData = data;
        this.sections = this.groupBySection(data);
        this.storeOriginalPermissions();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading permission matrix:', error);
        this.snackBar.open('Failed to load menu configuration', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  groupBySection(data: MenuPermissionMatrix[]): any[] {
    const sectionsMap: { [key: string]: MenuPermissionMatrix[] } = {};
    const sectionOrder = ['MAIN', 'RELEASE_VALIDATION', 'SYSTEM_CONFIGURATION', 'ORGANIZATION', 'GLOBAL FEATURES', 'ADDITIONAL'];

    // Group by section
    data.forEach(item => {
      const section = item.menu_item.section;
      if (!sectionsMap[section]) {
        sectionsMap[section] = [];
      }
      sectionsMap[section].push(item);
    });

    // Build sections array
    const result: any[] = [];
    sectionOrder.forEach(sectionKey => {
      if (sectionsMap[sectionKey] && sectionsMap[sectionKey].length > 0) {
        result.push({
          key: sectionKey,
          label: this.sectionLabels[sectionKey] || sectionKey,
          items: sectionsMap[sectionKey]
        });
      }
    });

    return result;
  }

  getSectionIcon(sectionKey: string): string {
    const icons: { [key: string]: string } = {
      'MAIN': 'dashboard',
      'RELEASE_VALIDATION': 'verified',
      'SYSTEM_CONFIGURATION': 'settings',
      'ORGANIZATION': 'business',
      'GLOBAL FEATURES': 'language',
      'ADDITIONAL': 'more_horiz'
    };
    return icons[sectionKey] || 'folder';
  }

  isSectionFullyChecked(sectionKey: string, roleName: string): boolean {
    const section = this.sections.find(s => s.key === sectionKey);
    if (!section || section.items.length === 0) return false;

    return section.items.every((item: MenuPermissionMatrix) =>
      item.permissions[roleName] === true
    );
  }

  isSectionPartiallyChecked(sectionKey: string, roleName: string): boolean {
    const section = this.sections.find(s => s.key === sectionKey);
    if (!section || section.items.length === 0) return false;

    const checkedCount = section.items.filter((item: MenuPermissionMatrix) =>
      item.permissions[roleName] === true
    ).length;

    return checkedCount > 0 && checkedCount < section.items.length;
  }

  toggleSectionPermission(sectionKey: string, roleName: string, checked: boolean) {
    const section = this.sections.find(s => s.key === sectionKey);
    if (!section) return;

    section.items.forEach((item: MenuPermissionMatrix) => {
      // Skip internal-only menus for contact roles
      if (this.isContactRoleDisabled(item.menu_item, roleName)) {
        return;
      }
      this.togglePermission(item.menu_item.id, roleName, checked);
    });
  }

  toggleSection(sectionKey: string) {
    if (this.expandedSections.has(sectionKey)) {
      this.expandedSections.delete(sectionKey);
    } else {
      this.expandedSections.add(sectionKey);
    }
  }

  isSectionExpanded(sectionKey: string): boolean {
    return this.expandedSections.has(sectionKey);
  }

  storeOriginalPermissions() {
    this.originalPermissions.clear();
    this.originalAccessLevels.clear();
    this.matrixData.forEach(item => {
      // Store original permissions
      this.roles.forEach(role => {
        const key = `${item.menu_item.id}_${role.name}`;
        this.originalPermissions.set(key, item.permissions[role.name] || false);
      });
      // Store original access levels
      this.originalAccessLevels.set(item.menu_item.id, item.menu_item.access_level || 'customer_facing');
    });
  }

  togglePermission(menuId: number, roleName: string, canView: boolean) {
    const key = `${menuId}_${roleName}`;
    const original = this.originalPermissions.get(key);

    if (original === canView) {
      // Changed back to original, remove from changes
      this.changedPermissions.delete(key);
    } else {
      // Store the change
      this.changedPermissions.set(key, {
        menu_item_id: menuId,
        role_name: roleName,
        can_view: canView
      });
    }

    // Update the matrix data
    const item = this.matrixData.find(m => m.menu_item.id === menuId);
    if (item) {
      item.permissions[roleName] = canView;
    }

    this.updateChangeStatus();
  }

  updateChangeStatus() {
    this.hasChanges = this.changedPermissions.size > 0;
    this.changeCount = this.changedPermissions.size;
  }

  isRowChanged(menuId?: number): boolean {
    if (!menuId) return false;
    return Array.from(this.changedPermissions.values()).some(
      change => change.menu_item_id === menuId
    );
  }

  saveChanges() {
    if (!this.hasChanges) return;

    this.saving = true;
    const updates = Array.from(this.changedPermissions.values());

    const bulkUpdate: BulkPermissionUpdate = { updates };

    this.menuService.bulkUpdatePermissions(bulkUpdate).subscribe({
      next: (result) => {
        this.snackBar.open(
          `Successfully saved ${result.total} permission changes`,
          'Close',
          { duration: 3000 }
        );
        this.changedPermissions.clear();
        this.storeOriginalPermissions();
        this.updateChangeStatus();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error saving permissions:', error);
        this.snackBar.open('Failed to save changes', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  resetChanges() {
    this.changedPermissions.clear();
    this.loadPermissionMatrix();
    this.snackBar.open('Changes reset', 'Close', { duration: 2000 });
  }

  /**
   * Handle access level change for a menu item
   */
  onAccessLevelChange(menuItemId: number, newAccessLevel: string) {
    const originalAccessLevel = this.originalAccessLevels.get(menuItemId);
    const menuItem = this.matrixData.find(m => m.menu_item.id === menuItemId);

    if (!menuItem) {
      return;
    }

    // CRITICAL FIX: When this method is called, we need to determine what the PREVIOUS value was
    // (before the user clicked the dropdown). However, Angular's two-way binding has already
    // updated menuItem.menu_item.access_level to the new value by the time we get here.
    //
    // To fix the alternating password bug, we need to store and check against the CURRENT
    // runtime value before the change, not just the original page-load value.
    //
    // The proper logic is:
    // - If changing FROM original TO something else: Require password
    // - If changing FROM modified state TO another modified state: Require password
    // - If changing FROM modified state BACK TO original: Allow without password (revert)
    //
    // To implement this, we'll store the previous access level before Angular updates it.
    // Since we can't prevent Angular's binding, we'll track it using a separate Map.

    // Get the current runtime value BEFORE this change attempt
    // This is stored in our tracking Map, or falls back to original if never changed
    const previousAccessLevel = (menuItem as any)._runtimeAccessLevel || originalAccessLevel;

    // Update the tracking value to the new one
    (menuItem as any)._runtimeAccessLevel = newAccessLevel;

    // Determine if we need password:
    // - If previous === original && new !== original: Need password (moving away from original)
    // - If previous !== original && new !== original && previous !== new: Need password (changing between non-original values)
    // - If previous !== original && new === original: NO password needed (reverting to original)
    const needsPassword = (previousAccessLevel === originalAccessLevel && newAccessLevel !== originalAccessLevel) ||
                         (previousAccessLevel !== originalAccessLevel && newAccessLevel !== originalAccessLevel && previousAccessLevel !== newAccessLevel);

    if (needsPassword) {
      // Revert the visual change temporarily
      menuItem.menu_item.access_level = previousAccessLevel;
      (menuItem as any)._runtimeAccessLevel = previousAccessLevel;

      const dialogRef = this.dialog.open(PasswordConfirmationDialogComponent, {
        width: '500px',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe((password: string | null) => {
        if (password) {
          // User provided password, verify it
          this.authService.verifyPassword(password).subscribe({
            next: (result) => {
              if (result.verified && result.is_system_admin) {
                // Password verified and user is System Admin, apply the change
                this.applyAccessLevelChange(menuItemId, newAccessLevel);
                (menuItem as any)._runtimeAccessLevel = newAccessLevel;
                this.snackBar.open('Access level changed successfully', 'Close', { duration: 3000 });
              } else {
                // Verification failed, revert tracking
                (menuItem as any)._runtimeAccessLevel = previousAccessLevel;
              }
            },
            error: (error) => {
              // Password verification failed
              let errorMessage = 'Password verification failed';
              if (error.status === 401) {
                errorMessage = 'Invalid password';
              } else if (error.status === 403) {
                errorMessage = 'System Admin privileges required';
              }

              this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
              (menuItem as any)._runtimeAccessLevel = previousAccessLevel;
            }
          });
        } else {
          // User cancelled, revert tracking
          (menuItem as any)._runtimeAccessLevel = previousAccessLevel;
        }
      });
    } else {
      // No password needed - either no change or reverting to original
      this.applyAccessLevelChange(menuItemId, newAccessLevel);
    }
  }

  /**
   * Apply the access level change after password verification (or if no verification needed)
   */
  private applyAccessLevelChange(menuItemId: number, newAccessLevel: string) {
    console.log(`Access level changed for menu ${menuItemId} to ${newAccessLevel}`);

    // Find the menu item and update it
    const menuItem = this.matrixData.find(m => m.menu_item.id === menuItemId);
    if (menuItem) {
      menuItem.menu_item.access_level = newAccessLevel;

      // If changing to 'internal_only', uncheck all contact role permissions
      if (newAccessLevel === 'internal_only') {
        const contactRoles = this.roles.filter(r => this.isContactRole(r.name));
        contactRoles.forEach(role => {
          if (menuItem.permissions[role.name]) {
            // Uncheck the permission
            this.togglePermission(menuItemId, role.name, false);
          }
        });
      }

      // Mark as changed (we need to save access_level changes too)
      this.hasChanges = true;
      this.changeCount++;
    }
  }

  /**
   * Check if a role is a contact role
   */
  isContactRole(roleName: string): boolean {
    return roleName === 'CONTACT_ORG_ADMIN' || roleName === 'CONTACT_USER';
  }

  /**
   * Determine if a checkbox should be disabled for contact roles on internal-only menus
   * Contact roles cannot be given access to internal menus
   */
  isContactRoleDisabled(menuItem: any, roleName: string): boolean {
    return this.isContactRole(roleName) && menuItem.access_level === 'internal_only';
  }
}
