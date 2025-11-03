import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuditService } from '../services/audit.service';
import { AuditRecord } from '../models/audit.model';

@Component({
  selector: 'app-audit-trail-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="audit-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Audit Trail</h2>
            <p>View system activity and change history</p>
          </div>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading audit records...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="records" class="full-width-table">
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>TIMESTAMP</th>
            <td mat-cell *matCellDef="let record">{{ record.created_at | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>USER</th>
            <td mat-cell *matCellDef="let record">{{ record.user_name || 'System' }}</td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>ACTION</th>
            <td mat-cell *matCellDef="let record">
              <span class="code-badge">{{ record.action.toUpperCase() }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="entity">
            <th mat-header-cell *matHeaderCellDef>ENTITY</th>
            <td mat-cell *matCellDef="let record">{{ record.entity_type }}</td>
          </ng-container>

          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef>DETAILS</th>
            <td mat-cell *matCellDef="let record" class="details-cell">{{ record.details || '-' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="records.length === 0" class="no-data">
          <mat-icon class="no-data-icon">history</mat-icon>
          <p>No audit records found</p>
          <p class="no-data-hint">System activity and changes will appear here</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .audit-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }

    .loading-card { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .loading-card p { color: #666; margin: 0; }

    .table-card { overflow-x: auto; margin-top: 24px; }
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

    .details-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

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
export class AuditTrailListComponent implements OnInit {
  records: AuditRecord[] = [];
  loading = true;
  displayedColumns = ['timestamp', 'user', 'action', 'entity', 'details'];

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.auditService.getAuditRecords(100, 0).subscribe({
      next: (records) => {
        this.records = records;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading audit records:', err);
        this.loading = false;
      }
    });
  }
}
