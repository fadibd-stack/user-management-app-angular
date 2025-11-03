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
import { EditionsService, EditionCreate, EditionUpdate } from '../services/editions.service';
import { Edition } from '../models/edition.model';
import { EditionDialogComponent, EditionDialogData } from './edition-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Component({
  selector: 'app-editions-list',
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
    <div class="editions-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Editions</h2>
            <p>Manage regional editions for organizations</p>
          </div>
          <div class="header-actions">
            <button mat-stroked-button (click)="syncFromTrakintel()" [disabled]="syncing">
              <mat-icon>sync</mat-icon>
              {{ syncing ? 'Syncing...' : 'Sync from Trakintel' }}
            </button>
            <button mat-raised-button color="primary" (click)="addEdition()">
              <mat-icon>add</mat-icon>
              Add Edition
            </button>
          </div>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading editions...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="editions" class="full-width-table">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>CODE</th>
            <td mat-cell *matCellDef="let ed">
              <span class="code-badge">{{ ed.code }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>NAME</th>
            <td mat-cell *matCellDef="let ed">{{ ed.name }}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>DESCRIPTION</th>
            <td mat-cell *matCellDef="let ed">{{ ed.description || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let ed">
              <mat-chip class="status-chip" [class.active-chip]="ed.is_active">
                {{ ed.is_active ? 'ACTIVE' : 'INACTIVE' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
            <td mat-cell *matCellDef="let ed">
              <button mat-button (click)="editEdition(ed)">Edit</button>
              <button mat-button color="warn" (click)="deleteEdition(ed)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="editions.length === 0" class="no-data">
          <mat-icon class="no-data-icon">inventory_2</mat-icon>
          <p>No editions found</p>
          <p class="no-data-hint">Click "Sync from Trakintel" to import editions or "Add Edition" to create one manually</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .editions-container { padding: 24px; }
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
export class EditionsListComponent implements OnInit {
  editions: Edition[] = [];
  loading = true;
  syncing = false;
  displayedColumns = ['code', 'name', 'description', 'status', 'actions'];

  constructor(
    private editionsService: EditionsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEditions();
  }

  loadEditions(): void {
    this.loading = true;
    this.editionsService.getEditions().subscribe({
      next: (eds) => {
        this.editions = eds;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading editions:', err);
        this.snackBar.open('Failed to load editions', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  syncFromTrakintel(): void {
    this.syncing = true;
    this.snackBar.open('Syncing editions from Trakintel API...', '', { duration: 2000 });

    this.editionsService.syncFromTrakintel().subscribe({
      next: (response) => {
        this.syncing = false;
        // Show detailed sync results
        const message = `${response.message}`;
        this.snackBar.open(message, 'Close', { duration: 5000 });

        // Reload the editions list to show the synced data
        this.loadEditions();
      },
      error: (err) => {
        console.error('Error syncing editions:', err);
        this.syncing = false;

        // Handle specific error cases
        let errorMessage = 'Failed to sync editions from Trakintel';
        if (err.status === 403) {
          errorMessage = 'Access denied. Only system administrators can sync editions.';
        } else if (err.status === 400) {
          errorMessage = err.error?.detail || 'Trakintel API not configured. Please configure it in Settings first.';
        } else if (err.error?.detail) {
          errorMessage = err.error.detail;
        }

        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  addEdition(): void {
    const dialogRef = this.dialog.open<EditionDialogComponent, EditionDialogData, EditionCreate>(
      EditionDialogComponent,
      {
        width: '600px',
        data: { mode: 'add' }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editionsService.createEdition(result).subscribe({
          next: (newEdition) => {
            this.snackBar.open('Edition created successfully!', 'Close', { duration: 3000 });
            this.loadEditions();
          },
          error: (err) => {
            console.error('Error creating edition:', err);
            this.snackBar.open('Failed to create edition', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  editEdition(edition: Edition): void {
    const dialogRef = this.dialog.open<EditionDialogComponent, EditionDialogData, EditionUpdate>(
      EditionDialogComponent,
      {
        width: '600px',
        data: { mode: 'edit', edition }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editionsService.updateEdition(edition.id, result).subscribe({
          next: (updatedEdition) => {
            this.snackBar.open('Edition updated successfully!', 'Close', { duration: 3000 });
            this.loadEditions();
          },
          error: (err) => {
            console.error('Error updating edition:', err);
            this.snackBar.open('Failed to update edition', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteEdition(edition: Edition): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '400px',
        data: {
          title: 'Delete Edition',
          message: `Are you sure you want to delete "${edition.name}"? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      }
    );

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.editionsService.deleteEdition(edition.id).subscribe({
          next: () => {
            this.snackBar.open('Edition deleted successfully', 'Close', { duration: 3000 });
            this.loadEditions();
          },
          error: (err) => {
            console.error('Error deleting edition:', err);
            this.snackBar.open('Failed to delete edition', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
