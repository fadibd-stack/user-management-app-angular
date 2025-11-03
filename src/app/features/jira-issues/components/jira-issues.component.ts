import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-jira-issues',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="jira-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>JIRA Issues</h2>
            <p>Browse and manage JIRA issues</p>
          </div>
          <div class="header-actions">
            <button mat-stroked-button (click)="refreshIssues(false)" [disabled]="refreshing" title="Fetch only new/updated issues since last refresh">
              <mat-icon>sync</mat-icon>
              {{ refreshing ? 'Refreshing...' : 'Refresh (Incremental)' }}
            </button>
            <button mat-raised-button color="primary" (click)="refreshIssues(true)" [disabled]="refreshing" title="Fetch up to 5000 issues (full refresh)">
              <mat-icon>cloud_download</mat-icon>
              Full Refresh
            </button>
          </div>
        </div>
      </div>

      <mat-card *ngIf="!hasConfig" class="warning-card">
        <mat-icon>warning</mat-icon>
        <div>
          <strong>JIRA Not Configured</strong>
          <p>Please configure JIRA connection in Settings before using this feature.</p>
        </div>
      </mat-card>

      <mat-card class="filters-card">
        <div class="filter-row">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchTerm" placeholder="Search by key or summary...">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Issue Type</mat-label>
            <mat-select [(ngModel)]="selectedIssueType">
              <mat-option value="">All Types</mat-option>
              <mat-option *ngFor="let type of issueTypes" [value]="type">{{ type }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus">
              <mat-option value="">All Statuses</mat-option>
              <mat-option *ngFor="let status of statuses" [value]="status">{{ status }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fix Edition</mat-label>
            <mat-select [(ngModel)]="selectedFixEdition">
              <mat-option value="">All Editions</mat-option>
              <mat-option *ngFor="let edition of fixEditions" [value]="edition">{{ edition }}</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="applyFilters()">
            <mat-icon>search</mat-icon>
            Apply Filters
          </button>
        </div>
      </mat-card>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading JIRA issues...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="dataSource" class="full-width-table">
          <ng-container matColumnDef="key">
            <th mat-header-cell *matHeaderCellDef>KEY</th>
            <td mat-cell *matCellDef="let issue">
              <a [href]="issue.self" target="_blank" class="issue-link">{{ issue.key }}</a>
            </td>
          </ng-container>
          <ng-container matColumnDef="summary">
            <th mat-header-cell *matHeaderCellDef>SUMMARY</th>
            <td mat-cell *matCellDef="let issue">{{ issue.fields?.summary }}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>TYPE</th>
            <td mat-cell *matCellDef="let issue">
              <mat-chip [ngClass]="['type-chip', 'type-' + (issue.fields?.issuetype?.name || '').toLowerCase()]">
                {{ issue.fields?.issuetype?.name }}
              </mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let issue">
              <mat-chip *ngIf="issue.fields?.status?.name" [ngClass]="['status-chip', 'status-' + (issue.fields?.status?.name || '').toLowerCase().replace(' ', '-')]">
                {{ issue.fields.status.name }}
              </mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>PRIORITY</th>
            <td mat-cell *matCellDef="let issue">
              <mat-chip *ngIf="issue.fields?.priority?.name" [ngClass]="['priority-chip', 'priority-' + (issue.fields?.priority?.name || '').toLowerCase()]">
                {{ issue.fields.priority.name }}
              </mat-chip>
              <span *ngIf="!issue.fields?.priority?.name">-</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="assignee">
            <th mat-header-cell *matHeaderCellDef>ASSIGNEE</th>
            <td mat-cell *matCellDef="let issue">{{ issue.fields?.assignee?.displayName || 'Unassigned' }}</td>
          </ng-container>
          <ng-container matColumnDef="country">
            <th mat-header-cell *matHeaderCellDef>COUNTRY/REGION</th>
            <td mat-cell *matCellDef="let issue">{{ getCountryRegion(issue.fields?.customfield_13304) }}</td>
          </ng-container>
          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>CUSTOMER</th>
            <td mat-cell *matCellDef="let issue">{{ getCustomer(issue.fields?.customfield_13304) }}</td>
          </ng-container>
          <ng-container matColumnDef="fixEdition">
            <th mat-header-cell *matHeaderCellDef>FIX EDITION/S</th>
            <td mat-cell *matCellDef="let issue">{{ getFixEditions(issue.fields?.customfield_13331) }}</td>
          </ng-container>
          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef>CREATED</th>
            <td mat-cell *matCellDef="let issue">{{ formatDate(issue.fields?.created) }}</td>
          </ng-container>
          <ng-container matColumnDef="updated">
            <th mat-header-cell *matHeaderCellDef>UPDATED</th>
            <td mat-cell *matCellDef="let issue">{{ formatDate(issue.fields?.updated) }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator
          #paginator
          [length]="dataSource.data.length"
          [pageSize]="50"
          [pageSizeOptions]="[25, 50, 100, 200]"
          showFirstLastButtons
          aria-label="Select page">
        </mat-paginator>

        <div *ngIf="dataSource.data.length === 0" class="no-data">
          <mat-icon class="no-data-icon">bug_report</mat-icon>
          <p>No JIRA issues found</p>
          <p class="no-data-hint">Click "Full Refresh" to fetch issues from JIRA or adjust your filters</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .jira-container { padding: 24px; }

    .page-header { margin-bottom: 24px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }
    .header-actions { display: flex; gap: 12px; }
    .header-actions button { min-width: 140px; }
    .header-actions mat-icon { margin-right: 8px; }

    .warning-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      margin-bottom: 24px;
      background-color: #fff3cd;
      color: #856404;
    }
    .warning-card mat-icon { font-size: 24px; width: 24px; height: 24px; }
    .warning-card strong { display: block; margin-bottom: 4px; }
    .warning-card p { margin: 0; font-size: 14px; }

    .filters-card { padding: 16px; margin-bottom: 24px; }
    .filter-row { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
    .filter-row mat-form-field { flex: 1; min-width: 200px; }
    .filter-row button mat-icon { margin-right: 8px; }

    .loading-card { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .loading-card p { color: #666; margin: 0; }

    .table-card { overflow-x: auto; }
    .full-width-table { width: 100%; }

    .issue-link {
      background-color: #1976d2;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-family: monospace;
      font-size: 13px;
      text-decoration: none;
      display: inline-block;
    }
    .issue-link:hover { background-color: #1565c0; }

    .type-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
    }

    /* Type color coding */
    .type-chip.type-bug { background-color: #ffebee !important; color: #c62828 !important; }
    .type-chip.type-feature { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .type-chip.type-improvement { background-color: #fff3e0 !important; color: #e65100 !important; }
    .type-chip.type-task { background-color: #f3e5f5 !important; color: #6a1b9a !important; }
    .type-chip.type-story { background-color: #e8f5e9 !important; color: #2e7d32 !important; }

    .status-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
    }

    /* Status color coding */
    .status-chip.status-to-do { background-color: #e3f2fd !important; color: #1976d2 !important; }
    .status-chip.status-in-progress { background-color: #fff3e0 !important; color: #f57c00 !important; }
    .status-chip.status-done { background-color: #e8f5e9 !important; color: #388e3c !important; }
    .status-chip.status-developed { background-color: #e8f5e9 !important; color: #388e3c !important; }
    .status-chip.status-closed { background-color: #f5f5f5 !important; color: #616161 !important; }
    .status-chip.status-reopened { background-color: #fff3e0 !important; color: #f57c00 !important; }
    .status-chip.status-resolved { background-color: #e8f5e9 !important; color: #388e3c !important; }
    .status-chip.status-open { background-color: #e3f2fd !important; color: #1976d2 !important; }

    .priority-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
    }

    .priority-chip.priority-urgent { background-color: #ffebee !important; color: #c62828 !important; }
    .priority-chip.priority-highest { background-color: #ffebee !important; color: #c62828 !important; }
    .priority-chip.priority-high { background-color: #fff3e0 !important; color: #e65100 !important; }
    .priority-chip.priority-medium { background-color: #fff9c4 !important; color: #f57f17 !important; }
    .priority-chip.priority-low { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .priority-chip.priority-lowest { background-color: #e3f2fd !important; color: #1565c0 !important; }

    th.mat-header-cell {
      font-weight: 600;
      font-size: 12px;
      color: #666;
      letter-spacing: 0.5px;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px 24px;
      text-align: center;
    }

    .no-data-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-data p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 16px;
      font-weight: 500;
    }

    .no-data-hint {
      color: #999;
      font-size: 14px;
      max-width: 400px;
    }
  `]
})
export class JiraIssuesComponent implements OnInit, AfterViewInit {
  @ViewChild('paginator') paginator!: MatPaginator;

  issues: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  statuses: string[] = [];
  issueTypes: string[] = [];
  fixEditions: string[] = [];
  loading = true;
  refreshing = false;
  hasConfig = false;
  searchTerm = '';
  selectedStatus = '';
  selectedIssueType = '';
  selectedFixEdition = '';
  displayedColumns = ['key', 'summary', 'type', 'status', 'priority', 'assignee', 'country', 'customer', 'fixEdition', 'created', 'updated'];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkConfig();
    this.loadIssues();
  }

  ngAfterViewInit(): void {
    // Connect paginator after view init
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  checkConfig(): void {
    this.apiService.get('/api/jira/config').subscribe({
      next: (config: any) => this.hasConfig = !!(config.jira_url && config.jira_api_token),
      error: () => this.hasConfig = false
    });
  }

  loadIssues(): void {
    this.loading = true;
    this.apiService.get<any>('/api/jira/issues').subscribe({
      next: (response) => {
        // Handle both array response and JIRA API response with issues array
        const issuesArray = Array.isArray(response) ? response : (response.issues || []);
        this.issues = issuesArray;
        this.dataSource.data = issuesArray;

        // Populate filter dropdowns
        this.statuses = [...new Set(issuesArray.map((i: any) => i.fields?.status?.name).filter(Boolean))] as string[];
        this.issueTypes = [...new Set(issuesArray.map((i: any) => i.fields?.issuetype?.name).filter(Boolean))] as string[];

        // Extract fix editions from customfield_13331
        const allEditions: string[] = [];
        issuesArray.forEach((issue: any) => {
          const editions = this.getFixEditions(issue.fields?.customfield_13331);
          if (editions !== '-') {
            editions.split(', ').forEach(ed => allEditions.push(ed.trim()));
          }
        });
        this.fixEditions = [...new Set(allEditions)].sort();

        this.loading = false;

        // Connect paginator after data loads and view is ready
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        });
      },
      error: (err) => {
        console.error('Error loading JIRA issues:', err);
        this.snackBar.open('Failed to load JIRA issues', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const filtered = this.issues.filter(issue => {
      const summary = issue.fields?.summary || '';
      const key = issue.key || '';
      const matchesSearch = !this.searchTerm ||
        summary.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        key.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesIssueType = !this.selectedIssueType || issue.fields?.issuetype?.name === this.selectedIssueType;
      const matchesStatus = !this.selectedStatus || issue.fields?.status?.name === this.selectedStatus;

      const matchesFixEdition = !this.selectedFixEdition || (() => {
        const editions = this.getFixEditions(issue.fields?.customfield_13331);
        return editions !== '-' && editions.includes(this.selectedFixEdition);
      })();

      return matchesSearch && matchesIssueType && matchesStatus && matchesFixEdition;
    });

    this.dataSource.data = filtered;
    // Reset to first page after filtering
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  refreshIssues(fullRefresh: boolean = false): void {
    if (!this.hasConfig) {
      this.snackBar.open('Please configure JIRA integration first.', 'Close', { duration: 3000 });
      return;
    }

    this.refreshing = true;
    const message = fullRefresh
      ? 'Full refresh (fetching up to 5000 issues)...'
      : 'Refreshing JIRA data (incremental)...';
    this.snackBar.open(message, '', { duration: 2000 });

    // First get the saved config
    this.apiService.get<any>('/api/jira/config').subscribe({
      next: (config) => {
        // Now refresh using the saved config
        const refreshPayload = {
          jira_url: config.jira_url,
          jira_email: config.jira_email,
          jira_api_token: config.jira_api_token,
          jira_project: config.jira_project || '',
          jira_issue_types: config.jira_issue_types || 'Bug,Feature',
          jql: config.jira_jql || 'ORDER BY updated DESC',
          full_refresh: fullRefresh
        };

        this.apiService.post('/api/jira/refresh', refreshPayload).subscribe({
          next: (response: any) => {
            this.refreshing = false;
            this.snackBar.open(`Success: ${response.message}`, 'Close', { duration: 3000 });
            this.loadIssues();
          },
          error: (err) => {
            console.error('Error refreshing JIRA:', err);
            const errorMsg = err.error?.detail || 'Failed to refresh from JIRA. Please check your JIRA configuration.';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
            this.refreshing = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching JIRA config:', err);
        this.snackBar.open('Failed to load JIRA configuration', 'Close', { duration: 5000 });
        this.refreshing = false;
      }
    });
  }

  getCountryRegion(customField: any): string {
    if (!customField) return '-';
    if (typeof customField === 'object' && customField.value) {
      return customField.value;
    }
    return '-';
  }

  getCustomer(customField: any): string {
    if (!customField) return '-';
    if (typeof customField === 'object' && customField.child && customField.child.value) {
      return customField.child.value;
    }
    return '-';
  }

  getFixEditions(customField: any): string {
    if (!customField) return '-';
    // customfield_13331 is typically an array of version objects
    if (Array.isArray(customField)) {
      const names = customField.map(edition => edition.name || edition.value || edition).filter(Boolean);
      return names.length > 0 ? names.join(', ') : '-';
    }
    // Handle single value
    if (typeof customField === 'object' && (customField.name || customField.value)) {
      return customField.name || customField.value;
    }
    if (typeof customField === 'string') return customField;
    return '-';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
