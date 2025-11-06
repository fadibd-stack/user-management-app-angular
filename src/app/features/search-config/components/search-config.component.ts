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
import { MatDividerModule } from '@angular/material/divider';

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
    MatCheckboxModule,
    MatDividerModule
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
        <!-- Search Settings Tab -->
        <mat-tab label="Search Settings">
          <mat-card>
            <h3>Global Search Configuration</h3>
            <p class="help-text">
              <mat-icon class="help-icon">info</mat-icon>
              Configure how the global search behaves across the entire application.
            </p>

            <div class="settings-grid">
              <mat-form-field appearance="outline" class="setting-field">
                <mat-label>Maximum Results</mat-label>
                <input matInput type="number" [(ngModel)]="searchSettings.maxResults" min="1" max="50">
                <mat-hint>Maximum number of results to show per search (1-50)</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="setting-field">
                <mat-label>Minimum Characters</mat-label>
                <input matInput type="number" [(ngModel)]="searchSettings.minChars" min="1" max="5">
                <mat-hint>Minimum characters before search starts (1-5)</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="setting-field">
                <mat-label>Debounce Time (ms)</mat-label>
                <input matInput type="number" [(ngModel)]="searchSettings.debounceTime" min="0" max="2000" step="100">
                <mat-hint>Delay before search starts (0-2000ms)</mat-hint>
              </mat-form-field>

              <div class="setting-field">
                <mat-slide-toggle [(ngModel)]="searchSettings.showQuickLinks" color="primary">
                  Show Quick Links in Results
                </mat-slide-toggle>
                <p class="toggle-hint">Display navigation shortcuts in search dropdown</p>
              </div>

              <div class="setting-field">
                <mat-slide-toggle [(ngModel)]="searchSettings.fuzzySearch" color="primary">
                  Enable Fuzzy Search
                </mat-slide-toggle>
                <p class="toggle-hint">Allow approximate matches for typos</p>
              </div>
            </div>

            <div class="actions-row">
              <button mat-raised-button (click)="resetSearchSettings()">
                <mat-icon>refresh</mat-icon>
                Reset to Defaults
              </button>
              <button mat-raised-button color="primary" (click)="saveSearchSettings()">
                <mat-icon>save</mat-icon>
                Save Settings
              </button>
            </div>

            <!-- Test Search Section -->
            <mat-divider class="section-divider"></mat-divider>
            <h3>Test Search</h3>
            <p class="help-text">
              <mat-icon class="help-icon">info</mat-icon>
              Test the search functionality with your current configuration.
            </p>

            <div class="test-search-container">
              <mat-form-field appearance="outline" class="test-search-field">
                <mat-label>Enter search query</mat-label>
                <input matInput [(ngModel)]="testSearchQuery" (input)="onTestSearch()" placeholder="Type to search...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <div class="test-results" *ngIf="testSearchResults.length > 0">
                <h4>Results ({{ testSearchResults.length }})</h4>
                <div class="test-result-item" *ngFor="let result of testSearchResults">
                  <mat-icon class="result-type-icon">{{ getIconForType(result.type) }}</mat-icon>
                  <div class="result-info">
                    <strong>{{ result.name }}</strong>
                    <span class="result-category">{{ result.category }}</span>
                  </div>
                </div>
              </div>

              <div class="no-results" *ngIf="testSearchQuery && testSearchResults.length === 0 && !testSearchLoading">
                <mat-icon>search_off</mat-icon>
                <p>No results found</p>
              </div>
            </div>
          </mat-card>
        </mat-tab>

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

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>DESCRIPTION</th>
                <td mat-cell *matCellDef="let config">
                  <span class="description-text">{{ config.description || 'No description' }}</span>
                </td>
              </ng-container>

              <!-- Search Fields Column -->
              <ng-container matColumnDef="search_fields">
                <th mat-header-cell *matHeaderCellDef>SEARCH FIELDS</th>
                <td mat-cell *matCellDef="let config">
                  <div class="fields-container">
                    <mat-chip *ngFor="let field of config.search_fields?.split(',') || []">
                      {{ field.trim() }}
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

        <!-- Menu Search Tab -->
        <mat-tab label="Menu Search">
          <mat-card>
            <h3>Menu & Navigation Search Configuration</h3>
            <p class="help-text">
              <mat-icon class="help-icon">info</mat-icon>
              Configure which menu items and pages appear in search results. Users can type page names or keywords to quickly navigate.
            </p>

            <div class="menu-search-options">
              <mat-slide-toggle [(ngModel)]="menuSearchEnabled" color="primary" (change)="toggleMenuSearch()">
                Enable Menu Search
              </mat-slide-toggle>
              <p class="toggle-hint">Allow users to search for pages and menu items</p>
            </div>

            <div class="searchable-menus" *ngIf="menuSearchEnabled">
              <h4>Searchable Menu Items</h4>
              <div class="menu-item-list">
                <div class="menu-item-card" *ngFor="let item of searchableMenuItems">
                  <div class="menu-item-header">
                    <mat-icon class="menu-item-icon">{{ item.icon }}</mat-icon>
                    <div class="menu-item-info">
                      <strong>{{ item.label }}</strong>
                      <span class="menu-item-path">{{ item.path }}</span>
                    </div>
                    <mat-slide-toggle [(ngModel)]="item.searchable" color="primary">
                    </mat-slide-toggle>
                  </div>
                  <div class="menu-item-keywords">
                    <mat-form-field appearance="outline" class="keywords-field">
                      <mat-label>Search Keywords</mat-label>
                      <input matInput [(ngModel)]="item.keywords" placeholder="e.g., users, people, contacts">
                      <mat-hint>Comma-separated keywords for finding this page</mat-hint>
                    </mat-form-field>
                  </div>
                </div>
              </div>
              <div class="actions-row">
                <button mat-raised-button color="primary" (click)="saveMenuSearchConfig()">
                  <mat-icon>save</mat-icon>
                  Save Menu Configuration
                </button>
              </div>
            </div>
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

        <!-- Search Analytics Tab -->
        <mat-tab label="Analytics & History">
          <mat-card>
            <h3>Search Usage Analytics</h3>
            <p class="help-text">
              <mat-icon class="help-icon">info</mat-icon>
              View search usage statistics and popular queries to improve search configuration.
            </p>

            <div class="analytics-grid">
              <mat-card class="stat-card">
                <mat-icon class="stat-icon">search</mat-icon>
                <div class="stat-value">{{ searchStats.totalSearches }}</div>
                <div class="stat-label">Total Searches</div>
              </mat-card>

              <mat-card class="stat-card">
                <mat-icon class="stat-icon">people</mat-icon>
                <div class="stat-value">{{ searchStats.uniqueUsers }}</div>
                <div class="stat-label">Unique Users</div>
              </mat-card>

              <mat-card class="stat-card">
                <mat-icon class="stat-icon">trending_up</mat-icon>
                <div class="stat-value">{{ searchStats.avgSearchesPerDay }}</div>
                <div class="stat-label">Avg. Searches/Day</div>
              </mat-card>

              <mat-card class="stat-card">
                <mat-icon class="stat-icon">speed</mat-icon>
                <div class="stat-value">{{ searchStats.avgResponseTime }}ms</div>
                <div class="stat-label">Avg. Response Time</div>
              </mat-card>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <h3>Popular Search Queries</h3>
            <table mat-table [dataSource]="popularSearches" class="full-width-table">
              <ng-container matColumnDef="rank">
                <th mat-header-cell *matHeaderCellDef>RANK</th>
                <td mat-cell *matCellDef="let item; let i = index">
                  <span class="rank-badge">{{ i + 1 }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="query">
                <th mat-header-cell *matHeaderCellDef>SEARCH QUERY</th>
                <td mat-cell *matCellDef="let item">
                  <strong>{{ item.query }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="count">
                <th mat-header-cell *matHeaderCellDef>COUNT</th>
                <td mat-cell *matCellDef="let item">
                  <span class="count-badge">{{ item.count }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>TOP RESULT TYPE</th>
                <td mat-cell *matCellDef="let item">
                  <mat-chip>{{ item.topResultType }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button (click)="runTestSearchQuery(item.query)" matTooltip="Test this query">
                    <mat-icon>play_arrow</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="popularSearchColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: popularSearchColumns;"></tr>
            </table>

            <mat-divider class="section-divider"></mat-divider>

            <h3>Recent Searches (Last 24 hours)</h3>
            <div class="recent-searches">
              <div class="recent-search-item" *ngFor="let search of recentSearches">
                <div class="search-time">{{ search.timestamp | date:'short' }}</div>
                <div class="search-query">
                  <mat-icon>search</mat-icon>
                  <strong>{{ search.query }}</strong>
                </div>
                <div class="search-user">{{ search.username }}</div>
                <div class="search-results">{{ search.resultCount }} results</div>
              </div>
            </div>

            <div class="actions-row">
              <button mat-raised-button (click)="refreshAnalytics()">
                <mat-icon>refresh</mat-icon>
                Refresh Analytics
              </button>
              <button mat-raised-button (click)="exportSearchData()">
                <mat-icon>download</mat-icon>
                Export Data
              </button>
            </div>
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

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin: 24px 0;
    }

    .setting-field {
      width: 100%;
    }

    .toggle-hint {
      margin: 8px 0 0 0;
      font-size: 12px;
      color: #666;
    }

    .actions-row {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .actions-row button mat-icon {
      margin-right: 8px;
    }

    .section-divider {
      margin: 32px 0 24px 0;
    }

    .test-search-container {
      margin-top: 16px;
    }

    .test-search-field {
      width: 100%;
      max-width: 600px;
    }

    .test-results {
      margin-top: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      max-width: 600px;
    }

    .test-results h4 {
      margin: 0;
      padding: 12px 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
      font-weight: 600;
      color: #666;
    }

    .test-result-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      gap: 12px;
    }

    .test-result-item:last-child {
      border-bottom: none;
    }

    .result-type-icon {
      color: #1976d2;
      font-size: 24px;
    }

    .result-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .result-info strong {
      font-size: 14px;
      color: #333;
    }

    .result-category {
      font-size: 12px;
      color: #666;
      background: #e3f2fd;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }

    .no-results {
      text-align: center;
      padding: 32px;
      color: #999;
      max-width: 600px;
      margin-top: 16px;
      border: 1px dashed #e0e0e0;
      border-radius: 4px;
    }

    .no-results mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .no-results p {
      margin: 0;
      font-size: 14px;
    }

    .description-text {
      font-size: 13px;
      color: #666;
      font-style: italic;
    }

    .fields-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .fields-container mat-chip {
      font-size: 11px;
      min-height: 24px;
      height: 24px;
      background-color: #f5f5f5 !important;
      color: #666 !important;
      font-family: monospace;
    }

    /* Menu Search Styles */
    .menu-search-options {
      margin: 16px 0;
    }

    .searchable-menus {
      margin-top: 24px;
    }

    .searchable-menus h4 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 16px 0;
    }

    .menu-item-list {
      display: grid;
      gap: 16px;
    }

    .menu-item-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }

    .menu-item-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .menu-item-icon {
      color: #1976d2;
      font-size: 24px;
    }

    .menu-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .menu-item-info strong {
      font-size: 14px;
      color: #333;
    }

    .menu-item-path {
      font-size: 12px;
      color: #999;
      font-family: monospace;
    }

    .menu-item-keywords {
      margin-top: 8px;
    }

    .keywords-field {
      width: 100%;
    }

    /* Analytics Styles */
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }

    .stat-card {
      text-align: center;
      padding: 24px 16px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
    }

    .stat-card:nth-child(2) {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-card:nth-child(3) {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-card:nth-child(4) {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .stat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      margin-bottom: 8px;
      opacity: 0.9;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      margin: 8px 0;
    }

    .stat-label {
      font-size: 13px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .rank-badge {
      background: #f5f5f5;
      color: #666;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
    }

    .count-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
    }

    .recent-searches {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }

    .recent-search-item {
      display: grid;
      grid-template-columns: 140px 1fr 150px 100px;
      gap: 16px;
      align-items: center;
      padding: 12px 16px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 13px;
    }

    .search-time {
      color: #999;
      font-size: 12px;
    }

    .search-query {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .search-query mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #1976d2;
    }

    .search-user {
      color: #666;
    }

    .search-results {
      color: #999;
      text-align: right;
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

  searchEntityColumns = ['entity_type', 'display_name', 'priority', 'description', 'search_fields', 'employee_only', 'is_enabled', 'actions'];
  quickLinkColumns = ['route', 'display_name', 'keywords', 'employee_only', 'is_enabled', 'actions'];

  // Search settings
  searchSettings = {
    maxResults: 5,
    minChars: 2,
    debounceTime: 300,
    showQuickLinks: true,
    fuzzySearch: false
  };

  // Test search properties
  testSearchQuery = '';
  testSearchResults: any[] = [];
  testSearchLoading = false;

  // Menu search properties
  menuSearchEnabled = true;
  searchableMenuItems: any[] = [
    { label: 'Dashboard', path: '/', icon: 'dashboard', searchable: true, keywords: 'home,main,overview' },
    { label: 'Organizations', path: '/organizations', icon: 'business', searchable: true, keywords: 'org,customer,client,company' },
    { label: 'Employees', path: '/employees', icon: 'badge', searchable: true, keywords: 'staff,user,people,team' },
    { label: 'Contacts', path: '/contacts', icon: 'contacts', searchable: true, keywords: 'contact,customer' },
    { label: 'Projects', path: '/projects', icon: 'folder', searchable: true, keywords: 'project,work' },
    { label: 'Releases', path: '/releases', icon: 'new_releases', searchable: true, keywords: 'release,version' },
    { label: 'Test Cases', path: '/test-cases', icon: 'assignment', searchable: true, keywords: 'test,case,qa,testing' },
    { label: 'Test Executions', path: '/test-executions', icon: 'play_circle_filled', searchable: true, keywords: 'execution,run,test' },
    { label: 'Groups & Permissions', path: '/groups', icon: 'groups', searchable: true, keywords: 'group,permission,access,security' },
    { label: 'Menu Configuration', path: '/menu-configuration', icon: 'settings_applications', searchable: true, keywords: 'menu,config,settings' },
    { label: 'Search Configuration', path: '/search-configuration', icon: 'search', searchable: true, keywords: 'search,config,find' }
  ];

  // Analytics properties
  searchStats = {
    totalSearches: 1247,
    uniqueUsers: 45,
    avgSearchesPerDay: 89,
    avgResponseTime: 145
  };

  popularSearches = [
    { query: 'organizations', count: 234, topResultType: 'Organization' },
    { query: 'test cases', count: 189, topResultType: 'Test Case' },
    { query: 'releases', count: 156, topResultType: 'Release' },
    { query: 'employees', count: 142, topResultType: 'User' },
    { query: 'projects', count: 98, topResultType: 'Project' }
  ];

  popularSearchColumns = ['rank', 'query', 'count', 'category', 'actions'];

  recentSearches = [
    { timestamp: new Date(Date.now() - 300000), query: 'test execution', username: 'john.doe', resultCount: 12 },
    { timestamp: new Date(Date.now() - 600000), query: 'organization ISC', username: 'jane.smith', resultCount: 1 },
    { timestamp: new Date(Date.now() - 900000), query: 'releases 2024', username: 'bob.jones', resultCount: 8 },
    { timestamp: new Date(Date.now() - 1200000), query: 'employees', username: 'alice.brown', resultCount: 45 },
    { timestamp: new Date(Date.now() - 1800000), query: 'projects', username: 'charlie.davis', resultCount: 23 }
  ];

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

  // Search Settings Methods
  saveSearchSettings(): void {
    // In a real app, this would save to backend
    localStorage.setItem('searchSettings', JSON.stringify(this.searchSettings));
    this.snackBar.open('Search settings saved!', 'Close', { duration: 3000 });
  }

  resetSearchSettings(): void {
    this.searchSettings = {
      maxResults: 5,
      minChars: 2,
      debounceTime: 300,
      showQuickLinks: true,
      fuzzySearch: false
    };
    this.snackBar.open('Settings reset to defaults', 'Close', { duration: 3000 });
  }

  // Test Search Methods
  onTestSearch(): void {
    if (this.testSearchQuery.length < this.searchSettings.minChars) {
      this.testSearchResults = [];
      return;
    }

    this.testSearchLoading = true;
    this.http.get<any>(`http://localhost:8000/api/search?q=${this.testSearchQuery}&limit=${this.searchSettings.maxResults}`).subscribe({
      next: (response) => {
        this.testSearchResults = response.results || [];
        this.testSearchLoading = false;
      },
      error: (err) => {
        console.error('Test search error:', err);
        this.testSearchResults = [];
        this.testSearchLoading = false;
      }
    });
  }

  getIconForType(type: string): string {
    const iconMap: {[key: string]: string} = {
      'organization': 'business',
      'user': 'person',
      'project': 'folder',
      'release': 'new_releases',
      'test_case': 'assignment',
      'employee': 'badge'
    };
    return iconMap[type] || 'description';
  }

  // Menu Search Methods
  toggleMenuSearch(): void {
    localStorage.setItem('menuSearchEnabled', JSON.stringify(this.menuSearchEnabled));
    this.snackBar.open(
      this.menuSearchEnabled ? 'Menu search enabled' : 'Menu search disabled',
      'Close',
      { duration: 3000 }
    );
  }

  saveMenuSearchConfig(): void {
    localStorage.setItem('searchableMenuItems', JSON.stringify(this.searchableMenuItems));
    this.snackBar.open('Menu search configuration saved!', 'Close', { duration: 3000 });
  }

  // Analytics Methods
  runTestSearchQuery(query: string): void {
    this.testSearchQuery = query;
    this.onTestSearch();
  }

  refreshAnalytics(): void {
    // In a real app, this would fetch from backend
    this.snackBar.open('Analytics refreshed!', 'Close', { duration: 3000 });
  }

  exportSearchData(): void {
    // Create CSV data
    let csvContent = 'Query,Count,Top Result Type\n';
    this.popularSearches.forEach(item => {
      csvContent += `"${item.query}",${item.count},"${item.topResultType}"\n`;
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `search-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Search data exported!', 'Close', { duration: 3000 });
  }
}
