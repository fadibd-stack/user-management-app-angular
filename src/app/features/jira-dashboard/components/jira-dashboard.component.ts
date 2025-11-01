import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-jira-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatButtonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <h2>Jira Dashboard</h2>
        <p>Overview of Jira issues and statistics</p>
      </div>

      <mat-card *ngIf="message" class="message-card">
        {{ message }}
        <a mat-button routerLink="/jira-issues" color="primary">Go to Jira Issues</a>
      </mat-card>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
        <p>Loading statistics...</p>
      </mat-card>

      <div *ngIf="!loading && stats" class="stats-grid">
        <mat-card *ngIf="stats.by_status && stats.by_status.length > 0" class="chart-card">
          <h3>Issues by Status</h3>
          <div class="chart-content">
            <div *ngFor="let item of stats.by_status; let i = index" class="bar-row">
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-wrapper">
                <div class="bar" [style.width.%]="getPercentage(item.count, getMax(stats.by_status))"
                     [style.background-color]="getBarColor(i)">
                  <span class="bar-count">{{ item.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card *ngIf="stats.by_type && stats.by_type.length > 0" class="chart-card">
          <h3>Issues by Type</h3>
          <div class="chart-content">
            <div *ngFor="let item of stats.by_type; let i = index" class="bar-row">
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-wrapper">
                <div class="bar" [style.width.%]="getPercentage(item.count, getMax(stats.by_type))"
                     [style.background-color]="getBarColor(i)">
                  <span class="bar-count">{{ item.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card *ngIf="stats.by_project && stats.by_project.length > 0" class="chart-card">
          <h3>Issues by Project</h3>
          <div class="chart-content">
            <div *ngFor="let item of stats.by_project; let i = index" class="bar-row">
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-wrapper">
                <div class="bar" [style.width.%]="getPercentage(item.count, getMax(stats.by_project))"
                     [style.background-color]="getBarColor(i)">
                  <span class="bar-count">{{ item.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card *ngIf="stats.by_priority && stats.by_priority.length > 0" class="chart-card">
          <h3>Issues by Priority</h3>
          <div class="chart-content">
            <div *ngFor="let item of stats.by_priority; let i = index" class="bar-row">
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-wrapper">
                <div class="bar" [style.width.%]="getPercentage(item.count, getMax(stats.by_priority))"
                     [style.background-color]="getBarColor(i)">
                  <span class="bar-count">{{ item.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-header h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; }
    .page-header p { margin: 0; color: #666; }
    .message-card { padding: 16px; margin-bottom: 24px; background-color: #fff3cd; color: #856404; }
    .loading-card { display: flex; flex-direction: column; align-items: center; padding: 48px; }
    .loading-card p { margin-top: 16px; color: #666; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; }
    .chart-card { padding: 20px; }
    .chart-card h3 { margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #333; }
    .chart-content { display: flex; flex-direction: column; gap: 12px; }
    .bar-row { display: flex; align-items: center; gap: 12px; }
    .bar-label { min-width: 120px; font-size: 14px; color: #666; font-weight: 500; }
    .bar-wrapper { flex: 1; background-color: #f5f5f5; border-radius: 4px; overflow: hidden; height: 32px; }
    .bar { height: 100%; min-width: 40px; display: flex; align-items: center; padding: 0 8px; transition: width 0.3s ease; }
    .bar-count { color: white; font-size: 13px; font-weight: 600; }
  `]
})
export class JiraDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;
  message = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.message = '';

    this.apiService.get('/api/jira/stats').subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.message = 'No JIRA data found. Please refresh data from JIRA first.';
        } else {
          this.message = 'Error loading statistics. Please check your Jira configuration.';
        }
        this.loading = false;
      }
    });
  }

  getMax(data: any[]): number {
    return Math.max(...data.map(item => item.count || 0));
  }

  getPercentage(count: number, max: number): number {
    return max > 0 ? (count / max) * 100 : 0;
  }

  getBarColor(index: number): string {
    const colors = [
      '#4A90E2', '#50C878', '#FFB347', '#E57373',
      '#9575CD', '#4DB6AC', '#FFD54F', '#FF8A65',
      '#7986CB', '#81C784', '#FFB74D', '#F06292'
    ];
    return colors[index % colors.length];
  }
}
