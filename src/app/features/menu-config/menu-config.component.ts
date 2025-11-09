import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MenuService } from '../../core/services/menu.service';
import {
  MenuPermissionMatrix,
  RoleMenuPermissionCreate,
  BulkPermissionUpdate,
  EMPLOYEE_ROLES
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
    MatCardModule
  ],
  template: `
    <div class="menu-config-container">
      <div class="header">
        <h1>Menu Configuration</h1>
        <p class="subtitle">Configure which menus each employee role can access</p>
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
                <div class="role-select-all" *ngFor="let role of roles">
                  <mat-checkbox
                    [checked]="isSectionFullyChecked(section.key, role.name)"
                    [indeterminate]="isSectionPartiallyChecked(section.key, role.name)"
                    (change)="toggleSectionPermission(section.key, role.name, $event.checked)"
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
                  <div class="menu-details">
                    <span class="menu-label">{{ item.menu_item.label }}</span>
                    <span class="menu-path">{{ item.menu_item.path }}</span>
                  </div>
                </div>
                <div class="menu-permissions">
                  <mat-checkbox *ngFor="let role of roles"
                    [checked]="item.permissions[role.name]"
                    (change)="togglePermission(item.menu_item.id, role.name, $event.checked)"
                    [color]="'primary'"
                    class="role-checkbox">
                  </mat-checkbox>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }

    .section-header-row:hover {
      opacity: 0.95;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
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
      align-items: center;
      gap: 6px;
    }

    .role-label-small {
      font-size: 12px;
      font-weight: 500;
      opacity: 0.95;
    }

    .section-checkbox {
      transform: scale(0.9);
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

    .menu-permissions {
      display: flex;
      gap: 32px;
      align-items: center;
    }

    .role-checkbox {
      margin: 0;
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

    /* Different section colors */
    .section-card:nth-child(2) .section-header-row {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .section-card:nth-child(3) .section-header-row {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .section-card:nth-child(4) .section-header-row {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .section-card:nth-child(5) .section-header-row {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
  `]
})
export class MenuConfigComponent implements OnInit {
  matrixData: MenuPermissionMatrix[] = [];
  sections: any[] = [];
  roles = EMPLOYEE_ROLES;

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
    'ADDITIONAL': 'Additional Features'
  };

  private originalPermissions: Map<string, boolean> = new Map();
  private changedPermissions: Map<string, RoleMenuPermissionCreate> = new Map();

  constructor(
    private menuService: MenuService,
    private snackBar: MatSnackBar
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
    const sectionOrder = ['MAIN', 'RELEASE_VALIDATION', 'SYSTEM_CONFIGURATION', 'ORGANIZATION', 'ADDITIONAL'];

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
    this.matrixData.forEach(item => {
      this.roles.forEach(role => {
        const key = `${item.menu_item.id}_${role.name}`;
        this.originalPermissions.set(key, item.permissions[role.name] || false);
      });
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
}
