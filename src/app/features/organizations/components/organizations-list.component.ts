import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrganizationsService } from '../services/organizations.service';
import { Organization } from '../models/organization.model';
import { OrganizationFormComponent } from './organization-form.component';

@Component({
  selector: 'app-organizations-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="organizations-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Organizations</h2>
            <p>Manage customer organizations</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="openDialog()">
              <mat-icon>add</mat-icon>
              Add Organization
            </button>
          </div>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
        <p>Loading organizations...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="organizations" class="full-width-table">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let org">
              <span class="code-badge">{{ org.id }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>NAME</th>
            <td mat-cell *matCellDef="let org">{{ org.name }}</td>
          </ng-container>

          <ng-container matColumnDef="country">
            <th mat-header-cell *matHeaderCellDef>COUNTRY</th>
            <td mat-cell *matCellDef="let org">{{ org.country_name || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="deployment_mode">
            <th mat-header-cell *matHeaderCellDef>DEPLOYMENT</th>
            <td mat-cell *matCellDef="let org">
              <span *ngIf="org.deployment_mode" class="code-badge">{{ org.deployment_mode }}</span>
              <span *ngIf="!org.deployment_mode">-</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="version">
            <th mat-header-cell *matHeaderCellDef>VERSION</th>
            <td mat-cell *matCellDef="let org">{{ org.version || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let org">
              <mat-chip class="status-chip" [class.active-chip]="org.status === 'active'">
                {{ org.status?.toUpperCase() || 'INACTIVE' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
            <td mat-cell *matCellDef="let org">
              <button mat-button (click)="editOrganization(org)">Edit</button>
              <button mat-button color="warn" (click)="deleteOrganization(org)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="organizations.length === 0" class="no-data">
          <mat-icon class="no-data-icon">business</mat-icon>
          <p>No organizations found</p>
          <p class="no-data-hint">Click "Add Organization" to create your first organization</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .organizations-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }
    .header-actions { display: flex; gap: 12px; }
    .header-actions button { min-width: 140px; }
    .header-actions mat-icon { margin-right: 8px; }

    .loading-card { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .loading-card p { color: #666; margin: 0; }

    .table-card { overflow-x: auto; }
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
      background-color: #f5f5f5;
      color: #666;
    }

    .status-chip.active-chip {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

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
export class OrganizationsListComponent implements OnInit {
  organizations: Organization[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'name', 'country', 'deployment_mode', 'version', 'status', 'actions'];

  constructor(
    private organizationsService: OrganizationsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.loading = true;
    this.organizationsService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading organizations:', err);
        this.loading = false;
      }
    });
  }

  openDialog(org?: Organization): void {
    const dialogRef = this.dialog.open(OrganizationFormComponent, {
      width: '600px',
      data: org || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadOrganizations();
    });
  }

  editOrganization(org: Organization): void {
    this.openDialog(org);
  }

  deleteOrganization(org: Organization): void {
    if (confirm(`Delete organization "${org.name}"?`)) {
      this.organizationsService.deleteOrganization(org.id).subscribe({
        next: () => this.loadOrganizations(),
        error: (err) => {
          console.error('Error deleting organization:', err);
          alert('Failed to delete organization.');
        }
      });
    }
  }
}
