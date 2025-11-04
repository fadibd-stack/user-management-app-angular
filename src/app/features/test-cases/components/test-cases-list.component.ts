import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TestCasesService } from '../services/test-cases.service';
import { TestCase, SystemArea } from '../models/test-case.model';
import { AuthService } from '../../../core/services/auth.service';
import { TestCaseFormComponent } from './test-case-form.component';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { Organization } from '../../organizations/models/organization.model';
import { AdviceFormComponent } from '../../advice/components/advice-form.component';

@Component({
  selector: 'app-test-cases-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <div class="test-cases-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Test Cases</h2>
            <p>Manage and track test cases</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="accent" (click)="exportCSV()">
              <mat-icon>download</mat-icon>
              Export CSV
            </button>
            <button mat-raised-button color="primary" (click)="openTestCaseDialog()">
              <mat-icon>add</mat-icon>
              Add Test Case
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Priority</mat-label>
            <mat-select [(ngModel)]="filters.priority" (ngModelChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="critical">Critical</mat-option>
              <mat-option value="high">High</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="low">Low</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>System Area</mat-label>
            <mat-select [(ngModel)]="filters.system_area_id" (ngModelChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option *ngFor="let area of systemAreas" [value]="area.id">
                {{ area.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field" *ngIf="isInterSystemsUser">
            <mat-label>Organization</mat-label>
            <mat-select [(ngModel)]="filters.organization_id" (ngModelChange)="applyFilters()">
              <mat-option value="all">All Organizations</mat-option>
              <mat-option value="null">No Organization</mat-option>
              <mat-option *ngFor="let org of organizations" [value]="org.id">
                {{ org.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field search-field">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="filters.search" (ngModelChange)="applyFilters()" placeholder="Search title...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Results count -->
      <div class="results-count" *ngIf="!loading">
        Showing {{ filteredTestCases.length }} of {{ testCases.length }} test cases
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading test cases...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="filteredTestCases" class="full-width-table">
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let testCase">
              <span class="code-badge">TC-{{ testCase.id }}</span>
            </td>
          </ng-container>

          <!-- Title Column -->
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>TITLE</th>
            <td mat-cell *matCellDef="let testCase" class="title-cell">
              {{ testCase.title }}
            </td>
          </ng-container>

          <!-- System Area Column -->
          <ng-container matColumnDef="system_area">
            <th mat-header-cell *matHeaderCellDef>SYSTEM AREA</th>
            <td mat-cell *matCellDef="let testCase">
              <span *ngIf="testCase.system_area_name">{{ testCase.system_area_name }}</span>
              <span *ngIf="!testCase.system_area_name" class="text-muted">-</span>
            </td>
          </ng-container>

          <!-- Organization Column -->
          <ng-container matColumnDef="organization" *ngIf="isInterSystemsUser">
            <th mat-header-cell *matHeaderCellDef>ORGANIZATION</th>
            <td mat-cell *matCellDef="let testCase">
              <span *ngIf="testCase.organization_name">{{ testCase.organization_name }}</span>
              <span *ngIf="!testCase.organization_name" class="text-muted">No Organization</span>
            </td>
          </ng-container>

          <!-- Priority Column -->
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>PRIORITY</th>
            <td mat-cell *matCellDef="let testCase">
              <mat-chip class="priority-chip" [class]="'priority-' + testCase.priority">
                {{ formatPriority(testCase.priority).toUpperCase() }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Type Column -->
          <ng-container matColumnDef="test_type">
            <th mat-header-cell *matHeaderCellDef>TYPE</th>
            <td mat-cell *matCellDef="let testCase">
              {{ formatTestType(testCase.test_type) }}
            </td>
          </ng-container>

          <!-- Created By Column -->
          <ng-container matColumnDef="created_by">
            <th mat-header-cell *matHeaderCellDef>CREATED BY</th>
            <td mat-cell *matCellDef="let testCase">
              {{ testCase.created_by_name || '-' }}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
            <td mat-cell *matCellDef="let testCase">
              <button mat-icon-button [matTooltip]="'Ask for advice about this test case'" (click)="askForAdvice(testCase)">
                <mat-icon>help_outline</mat-icon>
              </button>
              <button mat-button (click)="editTestCase(testCase)">Edit</button>
              <button mat-button color="warn" (click)="deleteTestCase(testCase)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="filteredTestCases.length === 0" class="no-data">
          <mat-icon class="no-data-icon">assignment</mat-icon>
          <p>No test cases found</p>
          <p class="no-data-hint">Click "Add Test Case" to create your first test case</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-cases-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }
    .header-actions { display: flex; gap: 12px; }
    .header-actions button { min-width: 140px; }
    .header-actions mat-icon { margin-right: 8px; }

    .filters-card {
      margin-bottom: 16px;
      padding: 16px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-field {
      flex: 1;
      min-width: 150px;
    }

    .search-field {
      flex: 2;
      min-width: 200px;
    }

    .loading-card { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .loading-card p { color: #666; margin: 0; }

    .table-card { overflow-x: auto; margin-top: 16px; }
    .full-width-table { width: 100%; }

    .code-badge {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-family: monospace;
      font-size: 13px;
    }

    .title-cell {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .text-muted {
      color: #999;
    }

    .priority-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
    }

    .priority-critical { background-color: #ffebee; color: #c62828; }
    .priority-high { background-color: #fff3e0; color: #ef6c00; }
    .priority-medium { background-color: #fff8e1; color: #f57f17; }
    .priority-low { background-color: #e8f5e9; color: #2e7d32; }

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

    .results-count {
      font-size: 14px;
      color: #666;
      margin: 16px 0 8px 0;
      padding: 0 4px;
    }
  `]
})
export class TestCasesListComponent implements OnInit {
  testCases: TestCase[] = [];
  filteredTestCases: TestCase[] = [];
  systemAreas: SystemArea[] = [];
  organizations: Organization[] = [];
  loading = true;
  currentUser: any;

  filters = {
    priority: 'all',
    system_area_id: 'all',
    organization_id: 'all',
    search: ''
  };

  get displayedColumns(): string[] {
    const columns = ['id', 'title', 'system_area'];
    if (this.isInterSystemsUser) {
      columns.push('organization');
    }
    columns.push('priority', 'test_type', 'created_by', 'actions');
    return columns;
  }

  get isInterSystemsUser(): boolean {
    return this.currentUser?.user_type === 'employee';
  }

  constructor(
    private testCasesService: TestCasesService,
    private authService: AuthService,
    private organizationsService: OrganizationsService,
    private dialog: MatDialog,
    private http: HttpClient
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    console.log('🎯 TestCasesListComponent loaded - NEW VERSION with askForAdvice button!');
    console.log('Displayed columns:', this.displayedColumns);
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const requests: Promise<any>[] = [
      this.testCasesService.getTestCases().toPromise(),
      this.testCasesService.getSystemAreas().toPromise()
    ];

    // Fetch organizations for InterSystems users
    if (this.isInterSystemsUser) {
      requests.push(this.organizationsService.getOrganizations().toPromise());
    }

    Promise.all(requests).then((responses) => {
      this.testCases = responses[0] || [];
      this.systemAreas = responses[1] || [];

      if (this.isInterSystemsUser && responses[2]) {
        this.organizations = responses[2] || [];
      }

      this.applyFilters();
      this.loading = false;
    }).catch(err => {
      console.error('Error loading data:', err);
      this.testCases = [];
      this.systemAreas = [];
      this.organizations = [];
      this.filteredTestCases = [];
      this.loading = false;
    });
  }

  applyFilters(): void {
    if (!this.testCases) {
      this.filteredTestCases = [];
      return;
    }

    let filtered = [...this.testCases];

    if (this.filters.priority !== 'all') {
      filtered = filtered.filter(tc => tc.priority === this.filters.priority);
    }

    if (this.filters.system_area_id !== 'all') {
      filtered = filtered.filter(tc => tc.system_area_id === +this.filters.system_area_id);
    }

    if (this.filters.organization_id !== 'all') {
      if (this.filters.organization_id === 'null') {
        // Show test cases without organization
        filtered = filtered.filter(tc => !tc.organization_id);
      } else {
        filtered = filtered.filter(tc => tc.organization_id === +this.filters.organization_id);
      }
    }

    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase();
      filtered = filtered.filter(tc =>
        tc.title?.toLowerCase().includes(searchLower) ||
        tc.description?.toLowerCase().includes(searchLower)
      );
    }

    this.filteredTestCases = filtered;
  }

  openTestCaseDialog(testCase?: TestCase): void {
    const dialogRef = this.dialog.open(TestCaseFormComponent, {
      width: '800px',
      data: testCase || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  editTestCase(testCase: TestCase): void {
    this.openTestCaseDialog(testCase);
  }

  deleteTestCase(testCase: TestCase): void {
    if (confirm(`Are you sure you want to delete test case "${testCase.title}"?`)) {
      this.testCasesService.deleteTestCase(testCase.id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Error deleting test case:', err);
          alert('Failed to delete test case. Please try again.');
        }
      });
    }
  }

  formatPriority(priority: string): string {
    if (!priority) return '-';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  formatTestType(type: string): string {
    if (!type) return '-';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  exportCSV(): void {
    // Build query params based on current filters
    const params: any = {};
    if (this.filters.priority !== 'all') {
      params.priority = this.filters.priority;
    }
    if (this.filters.system_area_id !== 'all') {
      params.system_area_id = this.filters.system_area_id;
    }
    if (this.filters.organization_id !== 'all') {
      params.organization_id = this.filters.organization_id;
    }

    // Make HTTP request with authentication
    this.http.get('http://localhost:8000/api/test-cases/export.csv', {
      params,
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).subscribe({
      next: (blob) => {
        // Create blob URL and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `test_cases_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error exporting CSV:', err);
        alert('Error exporting CSV. Please try again.');
      }
    });
  }

  askForAdvice(testCase: TestCase): void {
    const dialogRef = this.dialog.open(AdviceFormComponent, {
      width: '600px',
      data: {
        testCaseId: testCase.id,
        testCaseTitle: testCase.title
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        alert('Advice request created successfully! You can view it in the Advice page.');
      }
    });
  }
}
