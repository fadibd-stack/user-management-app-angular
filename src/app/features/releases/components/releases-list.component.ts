import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReleasesService, ReleaseCreate, ReleaseUpdate } from '../services/releases.service';
import { Release } from '../models/release.model';
import { ReleaseDialogComponent, ReleaseDialogData } from './release-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Component({
  selector: 'app-releases-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="releases-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Releases</h2>
            <p>Manage software releases and versions</p>
          </div>
          <div class="header-actions">
            <button mat-stroked-button (click)="syncFromTrakintel()" [disabled]="syncing">
              <mat-icon>sync</mat-icon>
              {{ syncing ? 'Syncing...' : 'Sync from Trakintel' }}
            </button>
            <button mat-raised-button color="primary" (click)="addRelease()">
              <mat-icon>add</mat-icon>
              Add Release
            </button>
          </div>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
        <p>Loading releases...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="releases" class="full-width-table">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>CODE</th>
            <td mat-cell *matCellDef="let rel">
              <span class="code-badge">{{ rel.code }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>NAME</th>
            <td mat-cell *matCellDef="let rel">{{ rel.name }}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>DESCRIPTION</th>
            <td mat-cell *matCellDef="let rel">{{ rel.description || 'Imported from Trakintel API' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let rel">
              <mat-chip class="status-chip" [class.active-chip]="rel.is_active">
                {{ rel.is_active ? 'ACTIVE' : 'INACTIVE' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
            <td mat-cell *matCellDef="let rel">
              <button mat-button (click)="editRelease(rel)">Edit</button>
              <button mat-button color="warn" (click)="deleteRelease(rel)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="releases.length === 0" class="no-data">
          <mat-icon class="no-data-icon">inventory_2</mat-icon>
          <p>No releases found</p>
          <p class="no-data-hint">Click "Sync from Trakintel" to import releases or "Add Release" to create one manually</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .releases-container { padding: 24px; }
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
export class ReleasesListComponent implements OnInit {
  releases: Release[] = [];
  loading = true;
  syncing = false;
  displayedColumns = ['code', 'name', 'description', 'status', 'actions'];

  constructor(
    private releasesService: ReleasesService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadReleases();
  }

  loadReleases(): void {
    this.loading = true;
    this.releasesService.getReleases().subscribe({
      next: (rels) => {
        this.releases = rels;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading releases:', err);
        this.snackBar.open('Failed to load releases', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  syncFromTrakintel(): void {
    this.syncing = true;
    this.snackBar.open('Syncing releases from Trakintel API...', '', { duration: 2000 });

    this.releasesService.syncFromTrakintel().subscribe({
      next: (response) => {
        this.syncing = false;
        const message = `${response.message}`;
        this.snackBar.open(message, 'Close', { duration: 5000 });
        this.loadReleases();
      },
      error: (err) => {
        console.error('Error syncing releases:', err);
        this.syncing = false;

        let errorMessage = 'Failed to sync releases from Trakintel';
        if (err.status === 403) {
          errorMessage = 'Access denied. Only system administrators can sync releases.';
        } else if (err.status === 400) {
          errorMessage = err.error?.detail || 'Trakintel API not configured. Please configure it in Settings first.';
        } else if (err.error?.detail) {
          errorMessage = err.error.detail;
        }

        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  addRelease(): void {
    const dialogRef = this.dialog.open<ReleaseDialogComponent, ReleaseDialogData, ReleaseCreate>(
      ReleaseDialogComponent,
      {
        width: '600px',
        data: { mode: 'add' }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.releasesService.createRelease(result).subscribe({
          next: (newRelease) => {
            this.snackBar.open('Release created successfully!', 'Close', { duration: 3000 });
            this.loadReleases();
          },
          error: (err) => {
            console.error('Error creating release:', err);
            this.snackBar.open('Failed to create release', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  editRelease(release: Release): void {
    const dialogRef = this.dialog.open<ReleaseDialogComponent, ReleaseDialogData, ReleaseUpdate>(
      ReleaseDialogComponent,
      {
        width: '600px',
        data: { mode: 'edit', release }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.releasesService.updateRelease(release.id, result).subscribe({
          next: (updatedRelease) => {
            this.snackBar.open('Release updated successfully!', 'Close', { duration: 3000 });
            this.loadReleases();
          },
          error: (err) => {
            console.error('Error updating release:', err);
            this.snackBar.open('Failed to update release', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteRelease(release: Release): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '400px',
        data: {
          title: 'Delete Release',
          message: `Are you sure you want to delete "${release.name}"? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      }
    );

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.releasesService.deleteRelease(release.id).subscribe({
          next: () => {
            this.snackBar.open('Release deleted successfully', 'Close', { duration: 3000 });
            this.loadReleases();
          },
          error: (err) => {
            console.error('Error deleting release:', err);
            this.snackBar.open('Failed to delete release', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
