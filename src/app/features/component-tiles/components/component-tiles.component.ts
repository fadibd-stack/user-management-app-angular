import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SystemAreasService } from '../services/system-areas.service';
import { TestCasesService } from '../../test-cases/services/test-cases.service';
import { ProjectsService } from '../../projects/services/projects.service';
import { SystemArea, TestCaseStats } from '../models/system-area.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-component-tiles',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatProgressSpinnerModule],
  template: `
    <div class="tiles-container">
      <div class="page-header">
        <h2>System Areas</h2>
        <p *ngIf="currentProject">Project: {{ currentProject.name }}</p>
      </div>

      <div *ngIf="loading" class="loading">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading system areas...</p>
      </div>

      <div *ngIf="!loading" class="tiles-grid">
        <mat-card *ngFor="let area of systemAreas" class="tile-card" (click)="handleTileClick(area.id)">
          <div class="tile-header">
            <div class="tile-icon">{{ area.icon || '📦' }}</div>
            <div class="tile-name">{{ area.name }}</div>
          </div>

          <div class="tile-stats">
            <div class="total-count">{{ getStats(area.id).total }}</div>
            <div class="total-label">Total Tests</div>
          </div>

          <mat-progress-bar mode="determinate" [value]="getCompletionRate(area.id)"></mat-progress-bar>
          <div class="progress-label">{{ getCompletionRate(area.id) }}% Complete</div>

          <div class="status-breakdown">
            <div *ngIf="getStats(area.id).new > 0" class="status-item">
              <div class="status-dot status-new"></div>
              <span>{{ getStats(area.id).new }} New</span>
            </div>
            <div *ngIf="getStats(area.id).in_progress > 0" class="status-item">
              <div class="status-dot status-in-progress"></div>
              <span>{{ getStats(area.id).in_progress }} In Progress</span>
            </div>
            <div *ngIf="getStats(area.id).blocked > 0" class="status-item">
              <div class="status-dot status-blocked"></div>
              <span>{{ getStats(area.id).blocked }} Blocked</span>
            </div>
            <div *ngIf="getStats(area.id).failed > 0" class="status-item">
              <div class="status-dot status-failed"></div>
              <span>{{ getStats(area.id).failed }} Failed</span>
            </div>
          </div>
        </mat-card>
      </div>

      <div *ngIf="!loading && systemAreas.length === 0" class="no-data">
        <div class="no-data-text">No system areas configured</div>
        <div class="no-data-subtext">Add system areas to organize your test cases</div>
      </div>
    </div>
  `,
  styles: [`
    .tiles-container { padding: 24px; background-color: #fafafa; min-height: calc(100vh - 64px); }
    .page-header { margin-bottom: 24px; }
    .page-header h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; }
    .page-header p { margin: 0; color: #666; }
    .loading { display: flex; flex-direction: column; align-items: center; padding: 48px; }
    .loading p { margin-top: 16px; color: #666; }
    .tiles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .tile-card { padding: 20px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border-left: 3px solid #1976d2; }
    .tile-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .tile-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .tile-icon { font-size: 32px; }
    .tile-name { font-size: 18px; font-weight: 600; color: #333; }
    .tile-stats { text-align: center; margin-bottom: 16px; }
    .total-count { font-size: 36px; font-weight: 700; color: #1976d2; }
    .total-label { font-size: 12px; color: #999; text-transform: uppercase; }
    mat-progress-bar { margin: 12px 0 8px 0; height: 8px; border-radius: 4px; }
    .progress-label { text-align: center; font-size: 13px; color: #666; margin-bottom: 16px; }
    .status-breakdown { display: flex; flex-direction: column; gap: 8px; }
    .status-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #666; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .status-new { background-color: #757575; }
    .status-in-progress { background-color: #2196f3; }
    .status-blocked { background-color: #ff9800; }
    .status-failed { background-color: #e53e3e; }
    .no-data { text-align: center; padding: 64px 24px; }
    .no-data-text { font-size: 18px; font-weight: 600; color: #666; margin-bottom: 8px; }
    .no-data-subtext { font-size: 14px; color: #999; }
  `]
})
export class ComponentTilesComponent implements OnInit {
  systemAreas: any[] = [];
  testCaseStats: { [key: number]: TestCaseStats } = {};
  currentProject: any = null;
  loading = true;

  constructor(
    private systemAreasService: SystemAreasService,
    private testCasesService: TestCasesService,
    private projectsService: ProjectsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;

    // Load system areas only for now (projects and test-cases APIs have errors)
    this.systemAreasService.getSystemAreas().subscribe({
      next: (areas) => {
        this.systemAreas = areas;

        // Initialize empty stats for each area
        this.systemAreas.forEach(area => {
          this.testCaseStats[area.id] = {
            total: 0,
            new: 0,
            in_progress: 0,
            completed: 0,
            blocked: 0,
            failed: 0
          };
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading system areas:', err);
        this.loading = false;
      }
    });
  }

  getStats(areaId: number): TestCaseStats {
    return this.testCaseStats[areaId] || {
      total: 0,
      new: 0,
      in_progress: 0,
      completed: 0,
      blocked: 0,
      failed: 0
    };
  }

  getCompletionRate(areaId: number): number {
    const stats = this.getStats(areaId);
    return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  }

  handleTileClick(areaId: number): void {
    this.router.navigate(['/test-cases'], { queryParams: { system_area_id: areaId } });
  }
}
