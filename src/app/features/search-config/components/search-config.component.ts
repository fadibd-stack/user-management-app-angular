import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface SearchEntityConfig {
  id: number;
  entity_type: string;
  display_name: string;
  is_enabled: boolean;
  search_fields: string;
  result_template: string;
  employee_only: boolean;
  priority: number;
  description: string;
  _editing?: boolean;
}

interface QuickLinkConfig {
  id: number;
  route: string;
  display_name: string;
  keywords: string;
  is_enabled: boolean;
  employee_only: boolean;
  icon: string;
  description: string;
  _editing?: boolean;
}

@Component({
  selector: 'app-search-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  template: `
    <div class="search-config-container">
      <div class="page-header">
        <div>
          <h2>Search Configuration</h2>
          <p>Configure global search behavior, searchable entities, and quick links</p>
        </div>
        <button
          *ngIf="hasUnsavedChanges"
          mat-raised-button
          color="accent"
          (click)="applyChanges()"
          class="apply-button">
          <mat-icon>refresh</mat-icon>
          Apply Changes
        </button>
      </div>

      <!-- Warning banner when there are unsaved changes -->
      <div *ngIf="hasUnsavedChanges" class="warning-banner">
        <mat-icon>warning</mat-icon>
        <span>You have unsaved configuration changes. Click "Apply Changes" to activate them in search.</span>
      </div>

      <mat-tab-group>
        <!-- Search Entities Tab -->
        <mat-tab label="Searchable Entities">
          <mat-card>
            <h3>Configure which entities appear in global search results</h3>
            <p class="help-text">
              <mat-icon class="help-icon">info</mat-icon>
              <strong>Priority:</strong> Higher numbers appear first in search results (10 = highest, 1 = lowest)<br>
              <strong>Employee Only:</strong> If checked, only employees can search this entity (hidden from customer contacts)<br>
              Click <mat-icon class="inline-icon">edit</mat-icon> to edit, then <mat-icon class="inline-icon">save</mat-icon> to save changes.
            </p>

            <table mat-table [dataSource]="searchEntities" class="full-width-table">
              <!-- Entity Type Column -->
              <ng-container matColumnDef="entity_type">
                <th mat-header-cell *matHeaderCellDef>ENTITY TYPE</th>
                <td mat-cell *matCellDef="let config">
                  <span class="entity-type-badge">{{ config.entity_type }}</span>
                </td>
              </ng-container>

              <!-- Display Name Column -->
              <ng-container matColumnDef="display_name">
                <th mat-header-cell *matHeaderCellDef>DISPLAY NAME</th>
                <td mat-cell *matCellDef="let config">
                  <mat-form-field *ngIf="config._editing" appearance="outline" class="inline-field">
                    <input matInput [(ngModel)]="config.display_name">
                  </mat-form-field>
                  <span *ngIf="!config._editing">{{ config.display_name }}</span>
                </td>
              </ng-container>

              <!-- Priority Column -->
              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef>PRIORITY</th>
                <td mat-cell *matCellDef="let config">
                  <mat-form-field *ngIf="config._editing" appearance="outline" class="inline-field-small">
                    <input matInput type="number" [(ngModel)]="config.priority" min="0" max="100">
                  </mat-form-field>
                  <span *ngIf="!config._editing" class="priority-badge">{{ config.priority }}</span>
                </td>
              </ng-container>

              <!-- Employee Only Column -->
              <ng-container matColumnDef="employee_only">
                <th mat-header-cell *matHeaderCellDef>EMPLOYEE ONLY</th>
                <td mat-cell *matCellDef="let config">
                  <mat-checkbox *ngIf="config._editing" [(ngModel)]="config.employee_only" color="primary">
                  </mat-checkbox>
                  <mat-chip *ngIf="!config._editing" [class.employee-only-chip]="config.employee_only">
                    {{ config.employee_only ? 'YES' : 'NO' }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Enabled Column -->
              <ng-container matColumnDef="is_enabled">
                <th mat-header-cell *matHeaderCellDef>ENABLED</th>
                <td mat-cell *matCellDef="let config">
                  <mat-slide-toggle
                    [(ngModel)]="config.is_enabled"
                    (change)="updateSearchEntity(config)"
                    color="primary"
                    [disabled]="config._editing">
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
                <td mat-cell *matCellDef="let config">
                  <button *ngIf="!config._editing" mat-icon-button (click)="editSearchEntity(config)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button *ngIf="config._editing" mat-icon-button color="primary" (click)="saveSearchEntity(config)" matTooltip="Save">
                    <mat-icon>save</mat-icon>
                  </button>
                  <button *ngIf="config._editing" mat-icon-button (click)="cancelEditSearchEntity(config)" matTooltip="Cancel">
                    <mat-icon>close</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="searchEntityColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: searchEntityColumns;"></tr>
            </table>
          </mat-card>
        </mat-tab>

        <!-- Quick Links Tab -->
        <mat-tab label="Quick Links">
          <mat-card>
            <h3>Configure quick navigation links and keywords</h3>
            <p class="help-text">
              <mat-icon class="help-icon">info</mat-icon>
              <strong>Keywords:</strong> Enter comma-separated keywords (e.g., "emp,employee,staff")<br>
              <strong>Employee Only:</strong> If checked, only employees see this quick link<br>
              Click <mat-icon class="inline-icon">edit</mat-icon> to edit, then <mat-icon class="inline-icon">save</mat-icon> to save changes.
            </p>

            <table mat-table [dataSource]="quickLinks" class="full-width-table">
              <!-- Route Column -->
              <ng-container matColumnDef="route">
                <th mat-header-cell *matHeaderCellDef>ROUTE</th>
                <td mat-cell *matCellDef="let config">
                  <span class="route-badge">{{ config.route }}</span>
                </td>
              </ng-container>

              <!-- Display Name Column -->
              <ng-container matColumnDef="display_name">
                <th mat-header-cell *matHeaderCellDef>DISPLAY NAME</th>
                <td mat-cell *matCellDef="let config">
                  <mat-form-field *ngIf="config._editing" appearance="outline" class="inline-field">
                    <input matInput [(ngModel)]="config.display_name">
                  </mat-form-field>
                  <div *ngIf="!config._editing">
                    <mat-icon class="route-icon">{{ config.icon || 'link' }}</mat-icon>
                    {{ config.display_name }}
                  </div>
                </td>
              </ng-container>

              <!-- Keywords Column -->
              <ng-container matColumnDef="keywords">
                <th mat-header-cell *matHeaderCellDef>KEYWORDS</th>
                <td mat-cell *matCellDef="let config">
                  <mat-form-field *ngIf="config._editing" appearance="outline" class="inline-field">
                    <input matInput [(ngModel)]="config.keywords" placeholder="keyword1,keyword2,keyword3">
                  </mat-form-field>
                  <div *ngIf="!config._editing" class="keywords-container">
                    <mat-chip *ngFor="let keyword of config.keywords.split(',')">
                      {{ keyword.trim() }}
                    </mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- Employee Only Column -->
              <ng-container matColumnDef="employee_only">
                <th mat-header-cell *matHeaderCellDef>EMPLOYEE ONLY</th>
                <td mat-cell *matCellDef="let config">
                  <mat-checkbox *ngIf="config._editing" [(ngModel)]="config.employee_only" color="primary">
                  </mat-checkbox>
                  <mat-chip *ngIf="!config._editing" [class.employee-only-chip]="config.employee_only">
                    {{ config.employee_only ? 'YES' : 'NO' }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Enabled Column -->
              <ng-container matColumnDef="is_enabled">
                <th mat-header-cell *matHeaderCellDef>ENABLED</th>
                <td mat-cell *matCellDef="let config">
                  <mat-slide-toggle
                    [(ngModel)]="config.is_enabled"
                    (change)="updateQuickLink(config)"
                    color="primary"
                    [disabled]="config._editing">
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
                <td mat-cell *matCellDef="let config">
                  <button *ngIf="!config._editing" mat-icon-button (click)="editQuickLink(config)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button *ngIf="config._editing" mat-icon-button color="primary" (click)="saveQuickLink(config)" matTooltip="Save">
                    <mat-icon>save</mat-icon>
                  </button>
                  <button *ngIf="config._editing" mat-icon-button (click)="cancelEditQuickLink(config)" matTooltip="Cancel">
                    <mat-icon>close</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="quickLinkColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: quickLinkColumns;"></tr>
            </table>
          </mat-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .search-config-container {
      padding: 24px;
    }

    .page-header {
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .page-header h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1976d2;
    }

    .page-header p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .apply-button {
      font-size: 16px;
      font-weight: 600;
      padding: 0 24px;
      height: 48px;
    }

    .apply-button mat-icon {
      margin-right: 8px;
    }

    .warning-banner {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #856404;
    }

    .warning-banner mat-icon {
      color: #ff9800;
    }

    mat-card {
      margin-top: 16px;
      padding: 24px;
    }

    mat-card h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .help-text {
      color: #666;
      font-size: 13px;
      margin: 0 0 24px 0;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      border-left: 4px solid #1976d2;
      line-height: 1.8;
    }

    .help-icon {
      vertical-align: middle;
      margin-right: 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #1976d2;
    }

    .inline-icon {
      vertical-align: middle;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .full-width-table {
      width: 100%;
      margin-top: 16px;
    }

    .inline-field {
      width: 200px;
      margin: -8px 0;
    }

    .inline-field-small {
      width: 80px;
      margin: -8px 0;
    }

    .entity-type-badge {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-family: monospace;
      font-size: 12px;
      text-transform: uppercase;
    }

    .route-badge {
      background-color: #f3e5f5;
      color: #7b1fa2;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-family: monospace;
      font-size: 12px;
    }

    .priority-badge {
      background-color: #fff3e0;
      color: #e65100;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 14px;
    }

    .employee-only-chip {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
      font-weight: 600 !important;
    }

    .keywords-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .keywords-container mat-chip {
      font-size: 11px;
      min-height: 24px;
      height: 24px;
      background-color: #f5f5f5;
    }

    .route-icon {
      vertical-align: middle;
      margin-right: 8px;
      color: #1976d2;
      font-size: 20px;
    }

    th.mat-header-cell {
      font-weight: 600;
      font-size: 12px;
      color: #666;
      letter-spacing: 0.5px;
    }

    mat-slide-toggle {
      margin: 0;
    }

    mat-checkbox {
      margin: 0;
    }
  `]
})
export class SearchConfigComponent implements OnInit {
  searchEntities: SearchEntityConfig[] = [];
  quickLinks: QuickLinkConfig[] = [];

  // Store original values for cancel
  private originalSearchEntities: Map<number, SearchEntityConfig> = new Map();
  private originalQuickLinks: Map<number, QuickLinkConfig> = new Map();

  // Track if there are unsaved changes
  hasUnsavedChanges = false;

  searchEntityColumns = ['entity_type', 'display_name', 'priority', 'employee_only', 'is_enabled', 'actions'];
  quickLinkColumns = ['route', 'display_name', 'keywords', 'employee_only', 'is_enabled', 'actions'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSearchEntities();
    this.loadQuickLinks();
  }

  loadSearchEntities(): void {
    this.http.get<SearchEntityConfig[]>('http://localhost:8000/api/search-entity-config').subscribe({
      next: (configs) => {
        this.searchEntities = configs.map(c => ({ ...c, _editing: false }));
      },
      error: (err) => {
        console.error('Error loading search entities:', err);
        this.snackBar.open('Failed to load search entity configuration', 'Close', { duration: 3000 });
      }
    });
  }

  loadQuickLinks(): void {
    this.http.get<QuickLinkConfig[]>('http://localhost:8000/api/quick-link-config').subscribe({
      next: (configs) => {
        this.quickLinks = configs.map(c => ({ ...c, _editing: false }));
      },
      error: (err) => {
        console.error('Error loading quick links:', err);
        this.snackBar.open('Failed to load quick link configuration', 'Close', { duration: 3000 });
      }
    });
  }

  editSearchEntity(config: SearchEntityConfig): void {
    // Save original for cancel
    this.originalSearchEntities.set(config.id, { ...config });
    config._editing = true;
  }

  cancelEditSearchEntity(config: SearchEntityConfig): void {
    const original = this.originalSearchEntities.get(config.id);
    if (original) {
      Object.assign(config, original);
      config._editing = false;
      this.originalSearchEntities.delete(config.id);
    }
  }

  saveSearchEntity(config: SearchEntityConfig): void {
    this.http.put(`http://localhost:8000/api/search-entity-config/${config.id}`, {
      display_name: config.display_name,
      priority: config.priority,
      employee_only: config.employee_only
    }).subscribe({
      next: () => {
        config._editing = false;
        this.originalSearchEntities.delete(config.id);
        this.hasUnsavedChanges = true;  // Mark as having unsaved changes
        this.snackBar.open('Configuration saved. Click "Apply Changes" to activate.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error updating search entity:', err);
        this.snackBar.open('Failed to update configuration', 'Close', { duration: 3000 });
      }
    });
  }

  updateSearchEntity(config: SearchEntityConfig): void {
    if (config._editing) return; // Don't update while editing

    this.http.put(`http://localhost:8000/api/search-entity-config/${config.id}`, {
      is_enabled: config.is_enabled
    }).subscribe({
      next: () => {
        this.hasUnsavedChanges = true;  // Mark as having unsaved changes
        this.snackBar.open(
          `${config.display_name} ${config.is_enabled ? 'enabled' : 'disabled'}. Click "Apply Changes" to activate.`,
          'Close',
          { duration: 3000 }
        );
      },
      error: (err) => {
        console.error('Error updating search entity:', err);
        config.is_enabled = !config.is_enabled; // Revert on error
        this.snackBar.open('Failed to update configuration', 'Close', { duration: 3000 });
      }
    });
  }

  editQuickLink(config: QuickLinkConfig): void {
    // Save original for cancel
    this.originalQuickLinks.set(config.id, { ...config });
    config._editing = true;
  }

  cancelEditQuickLink(config: QuickLinkConfig): void {
    const original = this.originalQuickLinks.get(config.id);
    if (original) {
      Object.assign(config, original);
      config._editing = false;
      this.originalQuickLinks.delete(config.id);
    }
  }

  saveQuickLink(config: QuickLinkConfig): void {
    this.http.put(`http://localhost:8000/api/quick-link-config/${config.id}`, {
      display_name: config.display_name,
      keywords: config.keywords,
      employee_only: config.employee_only
    }).subscribe({
      next: () => {
        config._editing = false;
        this.originalQuickLinks.delete(config.id);
        this.hasUnsavedChanges = true;  // Mark as having unsaved changes
        this.snackBar.open('Quick link saved. Click "Apply Changes" to activate.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error updating quick link:', err);
        this.snackBar.open('Failed to update quick link', 'Close', { duration: 3000 });
      }
    });
  }

  updateQuickLink(config: QuickLinkConfig): void {
    if (config._editing) return; // Don't update while editing

    this.http.put(`http://localhost:8000/api/quick-link-config/${config.id}`, {
      is_enabled: config.is_enabled
    }).subscribe({
      next: () => {
        this.hasUnsavedChanges = true;  // Mark as having unsaved changes
        this.snackBar.open(
          `Quick link ${config.is_enabled ? 'enabled' : 'disabled'}. Click "Apply Changes" to activate.`,
          'Close',
          { duration: 3000 }
        );
      },
      error: (err) => {
        console.error('Error updating quick link:', err);
        config.is_enabled = !config.is_enabled; // Revert on error
        this.snackBar.open('Failed to update configuration', 'Close', { duration: 3000 });
      }
    });
  }

  applyChanges(): void {
    this.http.post('http://localhost:8000/api/search/reload-config', {}).subscribe({
      next: (response: any) => {
        this.hasUnsavedChanges = false;
        this.snackBar.open(
          `Search configuration applied! ${response.entity_count} entities, ${response.quick_link_count} quick links loaded.`,
          'Close',
          { duration: 4000 }
        );
      },
      error: (err) => {
        console.error('Error reloading search configuration:', err);
        this.snackBar.open('Failed to apply changes', 'Close', { duration: 3000 });
      }
    });
  }
}
