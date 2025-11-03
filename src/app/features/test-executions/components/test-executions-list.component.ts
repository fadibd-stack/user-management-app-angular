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
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TestExecutionsService } from '../services/test-executions.service';
import { TestExecution } from '../models/test-execution.model';
import { ProjectsService } from '../../projects/services/projects.service';
import { EnvironmentsService } from '../../environments/services/environments.service';
import { AuthService } from '../../../core/services/auth.service';

interface Project {
  id: number;
  name: string;
  is_current?: boolean;
}

interface Environment {
  id: number;
  name: string;
  environment_type?: string;
}

@Component({
  selector: 'app-test-executions-list',
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
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  template: `
    <div class="executions-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Test Executions</h2>
            <p>Version-specific test execution results</p>
          </div>
          <button mat-raised-button color="primary" (click)="openBulkInitializeDialog()" [disabled]="!selectedProject">
            <mat-icon>playlist_add_check</mat-icon>
            Initialize All Tests
          </button>
        </div>
      </div>

      <!-- Bulk Result Message -->
      <mat-card *ngIf="bulkResult" class="bulk-result-card">
        <div class="bulk-result-content">
          <div class="bulk-result-title">✅ {{ bulkResult.message }}</div>
          <div class="bulk-result-details">
            Created: <strong>{{ bulkResult.created_count }}</strong> executions |
            Skipped: <strong>{{ bulkResult.skipped_count }}</strong> (already exist) |
            Total: <strong>{{ bulkResult.total_test_cases }}</strong> test cases
          </div>
        </div>
        <button mat-icon-button (click)="bulkResult = null">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Project/Version</mat-label>
            <mat-select [(ngModel)]="selectedProject" (ngModelChange)="onProjectChange()">
              <mat-option *ngFor="let project of projects" [value]="project">
                {{ project.name }} {{ project.is_current ? '(Current)' : '' }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="loadExecutions()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="new">New</mat-option>
              <mat-option value="in_progress">In Progress</mat-option>
              <mat-option value="passed">Passed</mat-option>
              <mat-option value="failed">Failed</mat-option>
              <mat-option value="blocked">Blocked</mat-option>
              <mat-option value="skipped">Skipped</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Environment</mat-label>
            <mat-select [(ngModel)]="selectedEnvironment" (ngModelChange)="loadExecutions()">
              <mat-option value="">All Environments</mat-option>
              <mat-option *ngFor="let env of environments" [value]="env.id">
                {{ env.name }} ({{ env.environment_type }})
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading test executions...</p>
      </mat-card>

      <mat-card *ngIf="!loading && executions.length === 0" class="empty-card">
        <div class="empty-state">
          <div class="empty-title">No test executions found</div>
          <div class="empty-subtitle">
            Test executions are created when you run tests for a specific project/version
          </div>
        </div>
      </mat-card>

      <mat-card *ngIf="!loading && executions.length > 0" class="table-card">
        <table mat-table [dataSource]="executions" class="full-width-table">
          <!-- Test Case Column -->
          <ng-container matColumnDef="test_case">
            <th mat-header-cell *matHeaderCellDef>TEST CASE</th>
            <td mat-cell *matCellDef="let exec">
              <div class="test-case-title">{{ exec.test_case_title }}</div>
              <div class="test-case-id">ID: {{ exec.test_case_id }}</div>
            </td>
          </ng-container>

          <!-- Status Column with Inline Editing -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let exec">
              <mat-form-field appearance="outline" class="status-select">
                <mat-select [(ngModel)]="exec.status" (ngModelChange)="updateStatus(exec, $event)">
                  <mat-option value="new">New</mat-option>
                  <mat-option value="in_progress">In Progress</mat-option>
                  <mat-option value="passed">Passed</mat-option>
                  <mat-option value="failed">Failed</mat-option>
                  <mat-option value="blocked">Blocked</mat-option>
                  <mat-option value="skipped">Skipped</mat-option>
                </mat-select>
              </mat-form-field>
            </td>
          </ng-container>

          <!-- Actual Result Column with Inline Editing -->
          <ng-container matColumnDef="actual_result">
            <th mat-header-cell *matHeaderCellDef>ACTUAL RESULT</th>
            <td mat-cell *matCellDef="let exec">
              <div *ngIf="editingResult !== exec.id"
                   class="actual-result-display"
                   (click)="startEditingResult(exec)">
                {{ exec.actual_result || 'Click to add result...' }}
              </div>
              <mat-form-field *ngIf="editingResult === exec.id" appearance="outline" class="actual-result-input">
                <textarea matInput
                          [(ngModel)]="exec.actual_result"
                          (blur)="saveActualResult(exec)"
                          rows="3"
                          cdkTextareaAutosize
                          #autosize="cdkTextareaAutosize"></textarea>
              </mat-form-field>
            </td>
          </ng-container>

          <!-- Started Date Column -->
          <ng-container matColumnDef="started_date">
            <th mat-header-cell *matHeaderCellDef>STARTED</th>
            <td mat-cell *matCellDef="let exec">
              {{ exec.started_date ? (exec.started_date | date:'short') : '-' }}
            </td>
          </ng-container>

          <!-- Completed Date Column -->
          <ng-container matColumnDef="completed_date">
            <th mat-header-cell *matHeaderCellDef>COMPLETED</th>
            <td mat-cell *matCellDef="let exec">
              {{ exec.completed_date ? (exec.completed_date | date:'short') : '-' }}
            </td>
          </ng-container>

          <!-- Actions/Status Badge Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let exec">
              <mat-chip class="status-chip" [class]="'status-' + (exec.status || '')">
                {{ formatStatus(exec.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .executions-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }

    .bulk-result-card {
      margin-bottom: 16px;
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .bulk-result-content { flex: 1; }
    .bulk-result-title { font-size: 14px; font-weight: 600; color: #155724; margin-bottom: 8px; }
    .bulk-result-details { font-size: 12px; color: #155724; }

    .filters-card { margin-bottom: 16px; padding: 16px; }
    .filters-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .filter-field { flex: 1; min-width: 200px; }

    .loading-card { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .loading-card p { color: #666; margin: 0; }

    .empty-card { padding: 64px 24px; text-align: center; }
    .empty-title { font-size: 18px; font-weight: 600; color: #424242; margin-bottom: 12px; }
    .empty-subtitle { font-size: 14px; color: #757575; }

    .table-card { overflow-x: auto; }
    .full-width-table { width: 100%; }

    .test-case-title { font-weight: 500; margin-bottom: 4px; }
    .test-case-id { font-size: 11px; color: #666; }

    .status-select { width: 150px; margin: 0; }
    .status-select ::ng-deep .mat-mdc-form-field-wrapper { padding-bottom: 0; }

    .actual-result-display {
      min-height: 40px;
      padding: 8px;
      border: 1px dashed #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: #424242;
    }
    .actual-result-display:empty::before {
      content: 'Click to add result...';
      color: #999;
    }

    .actual-result-input { width: 100%; margin: 0; }

    .status-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
      text-transform: uppercase;
    }

    .status-new { background-color: #e0e0e0; color: #424242; }
    .status-in_progress { background-color: #2196f3; color: white; }
    .status-passed { background-color: #4caf50; color: white; }
    .status-failed { background-color: #e53e3e; color: white; }
    .status-blocked { background-color: #ff9800; color: white; }
    .status-skipped { background-color: #9e9e9e; color: white; }

    th.mat-header-cell {
      font-weight: 600;
      font-size: 12px;
      color: #666;
      letter-spacing: 0.5px;
    }
  `]
})
export class TestExecutionsListComponent implements OnInit {
  executions: TestExecution[] = [];
  projects: Project[] = [];
  environments: Environment[] = [];
  selectedProject: Project | null = null;
  selectedStatus = '';
  selectedEnvironment: any = '';
  loading = true;
  editingResult: number | null = null;
  bulkResult: any = null;
  displayedColumns = ['test_case', 'status', 'actual_result', 'started_date', 'completed_date', 'actions'];
  currentUser: any;

  constructor(
    private executionsService: TestExecutionsService,
    private projectsService: ProjectsService,
    private environmentsService: EnvironmentsService,
    private authService: AuthService,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadEnvironments();
  }

  loadProjects(): void {
    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        const current = projects.find((p: Project) => p.is_current);
        if (current) {
          this.selectedProject = current;
        } else if (projects.length > 0) {
          this.selectedProject = projects[0];
        }
        if (this.selectedProject) {
          this.loadExecutions();
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.loading = false;
      }
    });
  }

  loadEnvironments(): void {
    this.environmentsService.getEnvironments().subscribe({
      next: (environments) => {
        this.environments = environments;
      },
      error: (err) => {
        console.error('Error loading environments:', err);
      }
    });
  }

  onProjectChange(): void {
    this.loadExecutions();
  }

  loadExecutions(): void {
    if (!this.selectedProject) return;

    this.loading = true;
    let params: any = { project_id: this.selectedProject.id };
    if (this.selectedStatus) params.status = this.selectedStatus;
    if (this.selectedEnvironment) params.environment_id = this.selectedEnvironment;

    this.http.get<TestExecution[]>('http://localhost:8000/api/test-executions', { params }).subscribe({
      next: (execs) => {
        this.executions = execs || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading executions:', err);
        this.executions = [];
        this.loading = false;
      }
    });
  }

  updateStatus(execution: TestExecution, newStatus: string): void {
    this.http.put(`http://localhost:8000/api/test-executions/${execution.id}`, {
      status: newStatus,
      executed_by_id: this.currentUser?.id || 1
    }).subscribe({
      next: () => {
        console.log('Status updated successfully');
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert('Error updating execution status');
        this.loadExecutions();
      }
    });
  }

  startEditingResult(execution: TestExecution): void {
    this.editingResult = execution.id;
  }

  saveActualResult(execution: TestExecution): void {
    this.editingResult = null;
    this.http.put(`http://localhost:8000/api/test-executions/${execution.id}`, {
      actual_result: execution.actual_result
    }).subscribe({
      next: () => {
        console.log('Actual result updated successfully');
      },
      error: (err) => {
        console.error('Error updating actual result:', err);
        alert('Error updating actual result');
      }
    });
  }

  openBulkInitializeDialog(): void {
    if (!this.selectedProject) return;

    const confirmed = confirm(
      `Initialize all tests for ${this.selectedProject.name}?\n\nThis will create test executions for all test cases. Test cases that already have executions will be skipped.`
    );

    if (confirmed) {
      this.bulkInitialize();
    }
  }

  bulkInitialize(): void {
    if (!this.selectedProject) return;

    this.loading = true;
    this.http.post('http://localhost:8000/api/test-executions/bulk-create', {
      project_id: this.selectedProject.id,
      initial_status: 'new'
    }).subscribe({
      next: (result: any) => {
        this.bulkResult = result;
        this.loadExecutions();
      },
      error: (err) => {
        console.error('Error bulk creating executions:', err);
        alert('Error: ' + (err.error?.detail || err.message));
        this.loading = false;
      }
    });
  }

  formatStatus(status: string): string {
    if (!status) return '-';
    return status.replace(/_/g, ' ').toUpperCase();
  }
}
