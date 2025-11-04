import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskPoolService } from '../services/task-pool.service';
import { TaskAssignment } from '../models/task.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-task-pool-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Edit Planning Fields - Task #{{ data.id }}</h2>
    <div mat-dialog-content>
      <p *ngIf="data.test_case_title" class="test-case-info">
        Test Case: #{{ data.test_case_id }} {{ data.test_case_title }}
      </p>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Task Type</mat-label>
        <mat-select [(ngModel)]="formData.task_type">
          <mat-option value="TESTING">Testing</mat-option>
          <mat-option value="BUILD">Build</mat-option>
          <mat-option value="TRAINING">Training</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Complexity</mat-label>
        <mat-select [(ngModel)]="formData.complexity">
          <mat-option [value]="null">Not set</mat-option>
          <mat-option value="simple">Simple</mat-option>
          <mat-option value="medium">Medium</mat-option>
          <mat-option value="complex">Complex</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Testing Type</mat-label>
        <mat-select [(ngModel)]="formData.testing_type">
          <mat-option [value]="null">Not set</mat-option>
          <mat-option value="functional">Functional</mat-option>
          <mat-option value="integration">Integration</mat-option>
          <mat-option value="regression">Regression</mat-option>
          <mat-option value="performance">Performance</mat-option>
          <mat-option value="security">Security</mat-option>
          <mat-option value="usability">Usability</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Effort Estimate (hours)</mat-label>
        <input matInput type="number" [(ngModel)]="formData.effort_estimate">
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Blocked Reason</mat-label>
        <textarea matInput [(ngModel)]="formData.blocked_reason" rows="3"></textarea>
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()">Save Changes</button>
    </div>
  `,
  styles: [`
    .test-case-info { font-size: 12px; color: #666; margin-bottom: 16px; }
    .full-width { width: 100%; margin-bottom: 12px; }
  `]
})
export class TaskPoolEditDialogComponent {
  formData: any = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TaskPoolEditDialogComponent>
  ) {
    this.formData = {
      task_type: data.task_type || 'TESTING',
      complexity: data.complexity,
      testing_type: data.testing_type,
      effort_estimate: data.effort_estimate,
      blocked_reason: data.blocked_reason
    };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const updates = { ...this.formData };
    if (updates.effort_estimate) updates.effort_estimate = parseInt(updates.effort_estimate);
    this.dialogRef.close(updates);
  }
}

@Component({
  selector: 'app-task-pool-list',
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
    <div class="task-pool-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Task Pool & Assignments</h2>
            <p>Claim and manage testing tasks</p>
          </div>
          <button mat-raised-button color="accent" (click)="exportCSV()">
            <mat-icon>download</mat-icon>
            Export CSV
          </button>
        </div>
      </div>

      <!-- Message Alert -->
      <mat-card *ngIf="message" class="message-card">
        <span>{{ message }}</span>
        <button mat-icon-button (click)="message = ''">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card>

      <!-- Status Filter -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filter by Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="loadTasks()">
              <mat-option value="all">All Tasks</mat-option>
              <mat-option value="in_pool">In Pool</mat-option>
              <mat-option value="claimed">Claimed</mat-option>
              <mat-option value="completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading tasks...</p>
      </mat-card>

      <mat-card *ngIf="!loading && dataSource.data.length === 0" class="empty-card">
        <mat-icon class="empty-icon">work</mat-icon>
        <p>No tasks found</p>
      </mat-card>

      <mat-card *ngIf="!loading && dataSource.data.length > 0" class="table-card">
        <table mat-table [dataSource]="dataSource" class="full-width-table">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let task">{{ task.id }}</td>
          </ng-container>

          <ng-container matColumnDef="test_case">
            <th mat-header-cell *matHeaderCellDef>TEST CASE</th>
            <td mat-cell *matCellDef="let task">
              <div class="test-case-title"><strong>#{{ task.test_case_id }}</strong> {{ task.test_case_title || 'N/A' }}</div>
              <div *ngIf="task.test_case_description" class="test-case-desc" [title]="task.test_case_description">
                {{ task.test_case_description }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="system_area">
            <th mat-header-cell *matHeaderCellDef>SYSTEM AREA</th>
            <td mat-cell *matCellDef="let task">{{ task.system_area_name || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>PRIORITY</th>
            <td mat-cell *matCellDef="let task">
              <mat-chip *ngIf="task.test_case_priority" class="priority-chip" [class]="'priority-' + task.test_case_priority">
                {{ task.test_case_priority }}
              </mat-chip>
              <span *ngIf="!task.test_case_priority">-</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let task">
              <mat-chip class="status-chip" [class]="'status-' + (task.status || '')">
                {{ (task.status | titlecase) || '-' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="owner">
            <th mat-header-cell *matHeaderCellDef>OWNER</th>
            <td mat-cell *matCellDef="let task">{{ task.user_id || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="task_type">
            <th mat-header-cell *matHeaderCellDef>TASK TYPE</th>
            <td mat-cell *matCellDef="let task">{{ task.task_type || 'TESTING' }}</td>
          </ng-container>

          <ng-container matColumnDef="complexity">
            <th mat-header-cell *matHeaderCellDef>COMPLEXITY</th>
            <td mat-cell *matCellDef="let task">{{ task.complexity || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="effort">
            <th mat-header-cell *matHeaderCellDef>EFFORT</th>
            <td mat-cell *matCellDef="let task">{{ task.effort_estimate || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="blocked">
            <th mat-header-cell *matHeaderCellDef>BLOCKED</th>
            <td mat-cell *matCellDef="let task">
              <span *ngIf="task.blocked_reason" class="blocked-badge" [title]="task.blocked_reason">
                ⚠️ Blocked
              </span>
              <span *ngIf="!task.blocked_reason">-</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
            <td mat-cell *matCellDef="let task">
              <div class="action-buttons">
                <button *ngIf="task.status === 'in_pool'"
                        mat-raised-button
                        color="primary"
                        (click)="claimTask(task)">
                  Claim
                </button>

                <ng-container *ngIf="task.status === 'claimed' && task.user_id === currentUser?.id">
                  <button mat-raised-button color="accent" (click)="editTask(task)">
                    Edit
                  </button>
                  <button mat-raised-button style="background-color: #388e3c; color: white;" (click)="completeTask(task)">
                    Complete
                  </button>
                  <button mat-button (click)="unclaimTask(task)">
                    Unclaim
                  </button>
                </ng-container>

                <span *ngIf="task.status === 'claimed' && task.user_id !== currentUser?.id" class="assigned-text">
                  (Assigned to user {{ task.user_id }})
                </span>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" [class.completed-row]="row.status === 'completed'"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .task-pool-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }

    .message-card {
      margin-bottom: 16px;
      background-color: #e3f2fd;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .filters-card { margin-bottom: 16px; padding: 16px; }
    .filters-row { display: flex; gap: 16px; }
    .filter-field { min-width: 200px; }

    .loading-card { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .loading-card p { color: #666; margin: 0; }

    .empty-card { display: flex; flex-direction: column; align-items: center; padding: 64px; }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; margin-bottom: 16px; }

    .table-card { overflow-x: auto; margin-top: 24px; }
    .full-width-table { width: 100%; }

    .test-case-title { font-weight: 500; margin-bottom: 4px; }
    .test-case-desc {
      font-size: 11px;
      color: #999;
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 4px;
    }

    .priority-chip, .status-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
    }

    .priority-high { background-color: #ffebee; color: #c62828; }
    .priority-medium { background-color: #fff3e0; color: #ef6c00; }
    .priority-low { background-color: #e8f5e9; color: #2e7d32; }

    .status-in_pool { background-color: #e3f2fd; color: #1976d2; }
    .status-claimed { background-color: #fff3e0; color: #f57c00; }
    .status-completed { background-color: #e8f5e9; color: #2e7d32; }

    .blocked-badge { font-size: 11px; color: #d32f2f; font-weight: 500; cursor: help; }

    .action-buttons { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .assigned-text { font-size: 12px; color: #999; }

    .completed-row { background-color: #f5f5f5; opacity: 0.7; }

    th.mat-header-cell {
      font-weight: 600;
      font-size: 12px;
      color: #666;
      letter-spacing: 0.5px;
    }
  `]
})
export class TaskPoolListComponent implements OnInit {
  dataSource = new MatTableDataSource<TaskAssignment>([]);
  loading = true;
  statusFilter = 'all';
  message = '';
  currentUser: any;
  displayedColumns = ['id', 'test_case', 'system_area', 'priority', 'status', 'owner', 'task_type', 'complexity', 'effort', 'blocked', 'actions'];

  constructor(
    private taskPoolService: TaskPoolService,
    private authService: AuthService,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    const url = this.statusFilter === 'all'
      ? 'http://localhost:8000/api/task-assignments?page=1&page_size=50'
      : `http://localhost:8000/api/task-assignments?status=${this.statusFilter}&page=1&page_size=50`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        const taskArray = Array.isArray(response) ? response : response?.data || [];
        this.dataSource.data = taskArray;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.message = 'Error loading assignments: ' + (err.error?.detail || err.message);
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  claimTask(task: TaskAssignment): void {
    this.taskPoolService.claimTask(task.id).subscribe({
      next: () => {
        this.message = 'Task claimed successfully!';
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error claiming task:', err);
        this.message = 'Error claiming task: ' + (err.error?.detail || err.message);
      }
    });
  }

  unclaimTask(task: TaskAssignment): void {
    this.taskPoolService.unclaimTask(task.id).subscribe({
      next: () => {
        this.message = 'Task unclaimed successfully!';
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error unclaiming task:', err);
        this.message = 'Error unclaiming task: ' + (err.error?.detail || err.message);
      }
    });
  }

  completeTask(task: TaskAssignment): void {
    this.http.put(`http://localhost:8000/api/task-assignments/${task.id}`, {
      status: 'completed'
    }).subscribe({
      next: () => {
        this.message = 'Task completed successfully!';
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error completing task:', err);
        this.message = 'Error completing task: ' + (err.error?.detail || err.message);
      }
    });
  }

  editTask(task: TaskAssignment): void {
    const dialogRef = this.dialog.open(TaskPoolEditDialogComponent, {
      width: '500px',
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePlanningFields(task.id, result);
      }
    });
  }

  updatePlanningFields(taskId: number, updates: any): void {
    this.http.put(`http://localhost:8000/api/task-assignments/${taskId}`, updates).subscribe({
      next: () => {
        this.message = 'Planning fields updated successfully!';
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.message = 'Error updating task: ' + (err.error?.detail || err.message);
      }
    });
  }

  exportCSV(): void {
    const params: any = {};
    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }

    this.http.get('http://localhost:8000/api/task-assignments/export.csv', {
      params,
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `task_assignments_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error exporting CSV:', err);
        this.message = 'Error exporting CSV: ' + (err.error?.detail || err.message);
      }
    });
  }
}
