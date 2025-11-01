import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TestExecutionsService } from '../services/test-executions.service';
import { TestExecution } from '../models/test-execution.model';

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
    MatFormFieldModule
  ],
  template: `
    <div class="executions-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Test Executions</h2>
            <p>Track test execution history and results</p>
          </div>
        </div>
      </div>

      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilters()">
              <mat-option value="">All</mat-option>
              <mat-option value="passed">Passed</mat-option>
              <mat-option value="failed">Failed</mat-option>
              <mat-option value="blocked">Blocked</mat-option>
              <mat-option value="skipped">Skipped</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
        <p>Loading test executions...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="filteredExecutions" class="full-width-table">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let exec">
              <span class="code-badge">{{ exec.id }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="test_case">
            <th mat-header-cell *matHeaderCellDef>TEST CASE</th>
            <td mat-cell *matCellDef="let exec">{{ exec.test_case_title }}</td>
          </ng-container>

          <ng-container matColumnDef="executed_by">
            <th mat-header-cell *matHeaderCellDef>EXECUTED BY</th>
            <td mat-cell *matCellDef="let exec">{{ exec.executed_by_name || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="execution_date">
            <th mat-header-cell *matHeaderCellDef>EXECUTION DATE</th>
            <td mat-cell *matCellDef="let exec">{{ exec.execution_date | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let exec">
              <mat-chip class="status-chip" [class]="'status-' + exec.status">
                {{ (exec.status | titlecase).toUpperCase() }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="environment">
            <th mat-header-cell *matHeaderCellDef>ENVIRONMENT</th>
            <td mat-cell *matCellDef="let exec">{{ exec.environment || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef>DURATION</th>
            <td mat-cell *matCellDef="let exec">
              {{ exec.duration_minutes ? exec.duration_minutes + ' min' : '-' }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="filteredExecutions.length === 0" class="no-data">
          <mat-icon class="no-data-icon">play_circle</mat-icon>
          <p>No test executions found</p>
          <p class="no-data-hint">Test execution results will appear here</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .executions-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }

    .filters-card { margin-bottom: 16px; padding: 16px; }
    .filters-row { display: flex; gap: 16px; }
    .filter-field { flex: 1; min-width: 150px; }

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

    .status-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
    }

    .status-passed { background-color: #e8f5e9; color: #2e7d32; }
    .status-failed { background-color: #ffebee; color: #d32f2f; }
    .status-blocked { background-color: #fff3e0; color: #e65100; }
    .status-skipped { background-color: #e0e0e0; color: #616161; }

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
export class TestExecutionsListComponent implements OnInit {
  executions: TestExecution[] = [];
  filteredExecutions: TestExecution[] = [];
  loading = true;
  selectedStatus = '';
  displayedColumns = ['id', 'test_case', 'executed_by', 'execution_date', 'status', 'environment', 'duration'];

  constructor(private executionsService: TestExecutionsService) {}

  ngOnInit(): void {
    this.loadExecutions();
  }

  loadExecutions(): void {
    this.loading = true;
    this.executionsService.getExecutions().subscribe({
      next: (execs) => {
        this.executions = execs;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading executions:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.executions];
    if (this.selectedStatus) {
      filtered = filtered.filter(e => e.status === this.selectedStatus);
    }
    this.filteredExecutions = filtered;
  }
}
