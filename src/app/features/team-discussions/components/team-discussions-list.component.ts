import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TeamDiscussionsService } from '../services/team-discussions.service';
import { TeamDiscussion } from '../models/discussion.model';

@Component({
  selector: 'app-team-discussions-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatChipsModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="discussions-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Team Discussions</h2>
            <p>Team collaboration and discussions</p>
          </div>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
        <p>Loading discussions...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="discussions" class="full-width-table">
          <ng-container matColumnDef="test_case">
            <th mat-header-cell *matHeaderCellDef>TEST CASE</th>
            <td mat-cell *matCellDef="let disc">{{ disc.test_case_title }}</td>
          </ng-container>

          <ng-container matColumnDef="teams">
            <th mat-header-cell *matHeaderCellDef>TEAMS</th>
            <td mat-cell *matCellDef="let disc">{{ disc.team1_name }} ↔ {{ disc.team2_name }}</td>
          </ng-container>

          <ng-container matColumnDef="scheduled_date">
            <th mat-header-cell *matHeaderCellDef>SCHEDULED</th>
            <td mat-cell *matCellDef="let disc">{{ disc.scheduled_date ? (disc.scheduled_date | date) : '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let disc">
              <mat-chip class="status-chip" [class]="'status-' + disc.status">{{ (disc.status | titlecase).toUpperCase() }}</mat-chip>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="discussions.length === 0" class="no-data">
          <mat-icon class="no-data-icon">forum</mat-icon>
          <p>No discussions found</p>
          <p class="no-data-hint">Team discussions will appear here</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .discussions-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }

    .loading-card { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .loading-card p { color: #666; margin: 0; }

    .table-card { overflow-x: auto; margin-top: 24px; }
    .full-width-table { width: 100%; }

    .status-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
    }

    .status-open { background-color: #e3f2fd; color: #1976d2; }
    .status-resolved { background-color: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background-color: #ffebee; color: #d32f2f; }

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
export class TeamDiscussionsListComponent implements OnInit {
  discussions: TeamDiscussion[] = [];
  loading = true;
  displayedColumns = ['test_case', 'teams', 'scheduled_date', 'status'];

  constructor(private discussionsService: TeamDiscussionsService) {}

  ngOnInit(): void {
    this.discussionsService.getDiscussions().subscribe({
      next: (discs) => { this.discussions = discs; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }
}
