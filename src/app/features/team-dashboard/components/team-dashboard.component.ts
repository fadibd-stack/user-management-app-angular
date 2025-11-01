import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamDashboardService } from '../services/team-dashboard.service';
import { GroupsService } from '../../groups/services/groups.service';
import { TeamSummary } from '../models/team-summary.model';
import { Group } from '../../groups/models/group.model';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <h2>Team Dashboard</h2>
        <div class="filters">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Group</mat-label>
            <mat-select [(ngModel)]="selectedGroup" (selectionChange)="loadSummary()">
              <mat-option [value]="null">All Groups</mat-option>
              <mat-option *ngFor="let group of groups" [value]="group.id">
                {{ group.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Range</mat-label>
            <mat-select [(ngModel)]="selectedRange" (selectionChange)="loadSummary()">
              <mat-option value="7d">Last 7 Days</mat-option>
              <mat-option value="30d">Last 30 Days</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>

      <div *ngIf="!loading && summary" class="dashboard-content">
        <mat-card class="info-bar">
          Showing metrics from {{ summary.range_start | date }} to {{ summary.range_end | date }}
        </mat-card>

        <mat-card class="section-card">
          <h3>Work Items by Status</h3>
          <div class="metrics-grid">
            <div class="metric-card in-pool">
              <div class="metric-header">In Pool</div>
              <div class="metric-value">{{ summary.work_items.in_pool }}</div>
              <div class="metric-footer">Available for claiming</div>
            </div>
            <div class="metric-card claimed">
              <div class="metric-header">Claimed</div>
              <div class="metric-value">{{ summary.work_items.claimed }}</div>
              <div class="metric-footer">In progress</div>
            </div>
            <div class="metric-card completed">
              <div class="metric-header">Completed</div>
              <div class="metric-value">{{ summary.work_items.completed }}</div>
              <div class="metric-footer">Done</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="section-card">
          <h3>Tasks by Type</h3>
          <div class="metrics-grid">
            <div class="metric-card type-build">
              <div class="metric-header">BUILD</div>
              <div class="metric-value">{{ summary.tasks_by_type.BUILD }}</div>
            </div>
            <div class="metric-card type-testing">
              <div class="metric-header">TESTING</div>
              <div class="metric-value">{{ summary.tasks_by_type.TESTING }}</div>
            </div>
            <div class="metric-card type-training">
              <div class="metric-header">TRAINING</div>
              <div class="metric-value">{{ summary.tasks_by_type.TRAINING }}</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="section-card">
          <h3>Alerts</h3>
          <div class="alerts-grid">
            <div class="alert-card overdue">
              <div class="alert-icon">⚠️</div>
              <div class="alert-content">
                <div class="alert-value">{{ summary.overdue }}</div>
                <div class="alert-label">Overdue Tasks</div>
              </div>
            </div>
            <div class="alert-card due-soon">
              <div class="alert-icon">📅</div>
              <div class="alert-content">
                <div class="alert-value">{{ summary.due_soon }}</div>
                <div class="alert-label">Due in Next 7 Days</div>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card *ngIf="summary.owner_load && summary.owner_load.length > 0" class="section-card">
          <h3>Top Users by Workload</h3>
          <table mat-table [dataSource]="summary.owner_load">
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef>Username</th>
              <td mat-cell *matCellDef="let owner">{{ owner.username }}</td>
            </ng-container>
            <ng-container matColumnDef="full_name">
              <th mat-header-cell *matHeaderCellDef>Full Name</th>
              <td mat-cell *matCellDef="let owner">{{ owner.full_name }}</td>
            </ng-container>
            <ng-container matColumnDef="claimed_count">
              <th mat-header-cell *matHeaderCellDef>Claimed Tasks</th>
              <td mat-cell *matCellDef="let owner">
                <span class="badge">{{ owner.claimed_count }}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="ownerColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: ownerColumns;"></tr>
          </table>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-header h2 { margin: 0; font-size: 28px; font-weight: 600; }
    .filters { display: flex; gap: 16px; }
    .filter-field { width: 180px; }
    .loading-card { display: flex; justify-content: center; padding: 48px; }
    .dashboard-content { display: flex; flex-direction: column; gap: 24px; }
    .info-bar { padding: 16px; text-align: center; background-color: #f5f5f5; }
    .section-card { padding: 24px; }
    .section-card h3 { margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #424242; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .metric-card { padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center; background-color: #fafafa; }
    .metric-header { font-size: 12px; color: #757575; text-transform: uppercase; font-weight: 600; margin-bottom: 12px; }
    .metric-value { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
    .metric-footer { font-size: 11px; color: #9e9e9e; }
    .metric-card.in-pool .metric-value { color: #757575; }
    .metric-card.claimed .metric-value { color: #2196f3; }
    .metric-card.completed .metric-value { color: #4caf50; }
    .alerts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
    .alert-card { display: flex; align-items: center; gap: 16px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fafafa; }
    .alert-card.overdue { border-left: 4px solid #e53e3e; }
    .alert-card.due-soon { border-left: 4px solid #ff9800; }
    .alert-icon { font-size: 32px; }
    .alert-value { font-size: 24px; font-weight: 700; color: #424242; }
    .alert-label { font-size: 13px; color: #757575; margin-top: 4px; }
    .badge { padding: 4px 12px; background-color: #1976d2; color: white; border-radius: 12px; font-size: 13px; font-weight: 600; }
  `]
})
export class TeamDashboardComponent implements OnInit {
  summary: TeamSummary | null = null;
  groups: Group[] = [];
  selectedGroup: number | null = null;
  selectedRange = '7d';
  loading = true;
  ownerColumns = ['username', 'full_name', 'claimed_count'];

  constructor(
    private dashboardService: TeamDashboardService,
    private groupsService: GroupsService
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.loadSummary();
  }

  loadGroups(): void {
    this.groupsService.getGroups().subscribe({
      next: (groups) => this.groups = groups,
      error: (err) => console.error('Error loading groups:', err)
    });
  }

  loadSummary(): void {
    this.loading = true;
    this.dashboardService.getTeamSummary(this.selectedRange, this.selectedGroup || undefined).subscribe({
      next: (summary) => { this.summary = summary; this.loading = false; },
      error: (err) => { console.error('Error loading summary:', err); this.loading = false; }
    });
  }
}
