import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskPoolService } from '../services/task-pool.service';
import { TaskAssignment } from '../models/task.model';

@Component({
  selector: 'app-task-pool-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="task-pool-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Task Pool</h2>
            <p>Claim and manage testing tasks</p>
          </div>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
        <p>Loading tasks...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="tasks" class="full-width-table">
          <ng-container matColumnDef="test_case">
            <th mat-header-cell *matHeaderCellDef>TEST CASE</th>
            <td mat-cell *matCellDef="let task">{{ task.test_case_title }}</td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>PRIORITY</th>
            <td mat-cell *matCellDef="let task">
              <mat-chip class="priority-chip" *ngIf="task.test_case_priority">{{ (task.test_case_priority | titlecase).toUpperCase() }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="assigned_to">
            <th mat-header-cell *matHeaderCellDef>ASSIGNED TO</th>
            <td mat-cell *matCellDef="let task">
              {{ task.user_name || task.group_name || '-' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let task">
              <mat-chip class="status-chip" [class]="'status-' + task.status">{{ (task.status | titlecase).toUpperCase() }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
            <td mat-cell *matCellDef="let task">
              <button mat-raised-button color="primary" *ngIf="task.status === 'in_pool'" (click)="claimTask(task)">
                Claim
              </button>
              <button mat-button *ngIf="task.status === 'claimed'" (click)="unclaimTask(task)">
                Unclaim
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="tasks.length === 0" class="no-data">
          <mat-icon class="no-data-icon">work</mat-icon>
          <p>No tasks in pool</p>
          <p class="no-data-hint">Tasks available for claiming will appear here</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .task-pool-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }

    .loading-card { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .loading-card p { color: #666; margin: 0; }

    .table-card { overflow-x: auto; margin-top: 24px; }
    .full-width-table { width: 100%; }

    .priority-chip, .status-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
    }

    .status-in_pool { background-color: #e3f2fd; color: #1976d2; }
    .status-claimed { background-color: #fff3e0; color: #f57c00; }
    .status-completed { background-color: #e8f5e9; color: #2e7d32; }

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
export class TaskPoolListComponent implements OnInit {
  tasks: TaskAssignment[] = [];
  loading = true;
  displayedColumns = ['test_case', 'priority', 'assigned_to', 'status', 'actions'];

  constructor(private taskPoolService: TaskPoolService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskPoolService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.loading = false;
      }
    });
  }

  claimTask(task: TaskAssignment): void {
    this.taskPoolService.claimTask(task.id).subscribe({
      next: () => this.loadTasks(),
      error: (err) => console.error('Error claiming task:', err)
    });
  }

  unclaimTask(task: TaskAssignment): void {
    this.taskPoolService.unclaimTask(task.id).subscribe({
      next: () => this.loadTasks(),
      error: (err) => console.error('Error unclaiming task:', err)
    });
  }
}
