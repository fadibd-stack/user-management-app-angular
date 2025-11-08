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

        <!-- Permission Matrix Table -->
        <mat-card class="matrix-card">
          <div class="table-container">
            <table mat-table [dataSource]="groupedMatrix" class="permission-matrix">

              <!-- Menu Column -->
              <ng-container matColumnDef="menu">
                <th mat-header-cell *matHeaderCellDef class="menu-column">Menu Item</th>
                <td mat-cell *matCellDef="let element" class="menu-cell">
                  <div class="menu-info">
                    <mat-icon class="menu-icon">{{ element.menu_item.icon || 'label' }}</mat-icon>
                    <div class="menu-details">
                      <span class="menu-label">{{ element.menu_item.label }}</span>
                      <span class="menu-path">{{ element.menu_item.path }}</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Role Columns -->
              <ng-container *ngFor="let role of roles" [matColumnDef]="role.name">
                <th mat-header-cell *matHeaderCellDef class="role-column">
                  <div class="role-header">
                    {{ role.label }}
                  </div>
                </th>
                <td mat-cell *matCellDef="let element" class="role-cell">
                  <mat-checkbox
                    [checked]="element.permissions[role.name]"
                    (change)="togglePermission(element.menu_item.id, role.name, $event.checked)"
                    [color]="'primary'">
                  </mat-checkbox>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  [class.section-header]="row.isSection"
                  [class.changed-row]="isRowChanged(row.menu_item?.id)">
              </tr>
            </table>
          </div>
        </mat-card>
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
      margin-bottom: 16px;
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

    .matrix-card {
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
      max-height: calc(100vh - 280px);
      overflow-y: auto;
    }

    .permission-matrix {
      width: 100%;
      border-collapse: collapse;
    }

    .mat-mdc-header-cell {
      background: #fafafa;
      font-weight: 600;
      padding: 16px 12px !important;
      border-bottom: 2px solid #e0e0e0;
    }

    .menu-column {
      min-width: 300px;
      position: sticky;
      left: 0;
      background: #fafafa;
      z-index: 10;
    }

    .role-column {
      min-width: 120px;
      text-align: center;
    }

    .role-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .mat-mdc-cell {
      padding: 12px !important;
      border-bottom: 1px solid #f0f0f0;
    }

    .menu-cell {
      position: sticky;
      left: 0;
      background: white;
      z-index: 5;
      border-right: 1px solid #e0e0e0;
    }

    .menu-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .menu-icon {
      color: #666;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .menu-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .menu-label {
      font-weight: 500;
      font-size: 14px;
    }

    .menu-path {
      font-size: 12px;
      color: #999;
    }

    .role-cell {
      text-align: center;
    }

    .changed-row {
      background-color: #fff9e6 !important;
    }

    .section-header {
      background: #e3f2fd !important;
      font-weight: bold;
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
  groupedMatrix: any[] = [];
  roles = EMPLOYEE_ROLES;
  displayedColumns: string[] = ['menu', ...EMPLOYEE_ROLES.map(r => r.name)];

  loading = false;
  saving = false;
  hasChanges = false;
  changeCount = 0;

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
        this.groupedMatrix = this.groupBySection(data);
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
    const sections: { [key: string]: MenuPermissionMatrix[] } = {};
    const sectionOrder = ['MAIN', 'RELEASE_VALIDATION', 'SYSTEM_CONFIGURATION', 'ORGANIZATION', 'ADDITIONAL'];

    // Group by section
    data.forEach(item => {
      const section = item.menu_item.section;
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(item);
    });

    // Build flat array with section headers
    const result: any[] = [];
    sectionOrder.forEach(sectionKey => {
      if (sections[sectionKey]) {
        result.push(...sections[sectionKey]);
      }
    });

    return result;
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
