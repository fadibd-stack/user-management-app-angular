import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectsService } from '../services/projects.service';
import { Project } from '../models/project.model';

@Component({
  selector: 'app-projects-list',
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
    <div class="projects-container">
      <div class="page-header">
        <div>
          <h2>Projects & Releases</h2>
          <p>Manage testing projects and releases</p>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="projects" class="projects-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let project">
              {{ project.name }}
              <mat-chip *ngIf="project.is_current" class="current-chip">Current</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let project">{{ project.description || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="start_date">
            <th mat-header-cell *matHeaderCellDef>Start Date</th>
            <td mat-cell *matCellDef="let project">{{ project.start_date | date }}</td>
          </ng-container>

          <ng-container matColumnDef="target_date">
            <th mat-header-cell *matHeaderCellDef>Target Date</th>
            <td mat-cell *matCellDef="let project">{{ project.target_date | date }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let project">
              <mat-chip [class]="'status-' + project.status">{{ project.status | titlecase }}</mat-chip>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <p *ngIf="projects.length === 0" class="no-data">No projects found</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .projects-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-header h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; }
    .page-header p { margin: 0; color: #666; }
    .table-card, .loading-card { margin-top: 24px; }
    .loading-card { display: flex; justify-content: center; padding: 48px; }
    .projects-table { width: 100%; }
    .no-data { text-align: center; padding: 48px; color: #999; }
    .current-chip { background-color: #e3f2fd; color: #1976d2; margin-left: 8px; }
    .status-open { background-color: #e8f5e9; color: #388e3c; }
    .status-closed { background-color: #e0e0e0; color: #616161; }
    .status-on_hold { background-color: #fff3e0; color: #f57c00; }
  `]
})
export class ProjectsListComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  displayedColumns = ['name', 'description', 'start_date', 'target_date', 'status'];

  constructor(private projectsService: ProjectsService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.loading = false;
      }
    });
  }
}
