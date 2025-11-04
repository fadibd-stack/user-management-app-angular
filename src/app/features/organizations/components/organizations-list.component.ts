import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OrganizationsService } from '../services/organizations.service';
import { AuthService } from '../../../core/services/auth.service';
import { Organization } from '../models/organization.model';
import { OrganizationFormComponent } from './organization-form.component';

@Component({
  selector: 'app-organizations-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule
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
            <button *ngIf="isSuperuser" mat-button (click)="syncTrakIntel()" [disabled]="syncing">
              <mat-icon>sync</mat-icon>
              <span *ngIf="!syncing">Sync TrakIntel</span>
              <mat-spinner *ngIf="syncing" diameter="20"></mat-spinner>
            </button>
            <button mat-raised-button color="primary" (click)="openDialog()">
              <mat-icon>add</mat-icon>
              Add Organization
            </button>
          </div>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading organizations...</p>
      </mat-card>

      <mat-card class="table-card">
        <!-- Search Bar -->
        <div class="search-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search Organizations</mat-label>
            <input matInput [(ngModel)]="searchTerm" (input)="filterOrganizations()" placeholder="Type to search...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>

        <div *ngIf="loading" style="display: flex; justify-content: center; padding: 48px;">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        </div>

        <table mat-table [dataSource]="dataSource" class="full-width-table" [style.display]="loading ? 'none' : 'table'">
          <ng-container matColumnDef="name">
            <td mat-cell *matCellDef="let org" class="org-name-cell">{{ org.name }}</td>
          </ng-container>

          <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="viewOrganization(row)" class="clickable-row"></tr>
        </table>

        <mat-paginator
          [pageSizeOptions]="[10, 20, 30, 50]"
          [pageSize]="10"
          [style.display]="loading ? 'none' : 'block'"
          showFirstLastButtons>
        </mat-paginator>

        <div *ngIf="!loading && dataSource.data.length === 0" class="no-data">
          <mat-icon class="no-data-icon">business</mat-icon>
          <p>{{ searchTerm ? 'No organizations match your search' : 'No organizations found' }}</p>
          <p class="no-data-hint" *ngIf="!searchTerm">Click "Add Organization" to create your first organization</p>
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

    .search-container {
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px 8px 0 0;
    }

    .search-field {
      width: 100%;
    }

    .full-width-table { width: 100%; }

    .org-name-cell {
      padding: 16px;
      font-size: 15px;
      color: #333;
      font-weight: 400;
    }

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

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clickable-row:hover {
      background-color: #f5f5f5;
    }
  `]
})
export class OrganizationsListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  organizations: Organization[] = [];
  dataSource = new MatTableDataSource<Organization>([]);
  loading = true;
  syncing = false;
  isSuperuser = false;
  searchTerm = '';
  displayedColumns: string[] = ['name'];

  constructor(
    private organizationsService: OrganizationsService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.isSuperuser = this.authService.currentUserValue?.is_superuser || false;

    // Set up custom filter predicate
    this.dataSource.filterPredicate = (data: Organization, filter: string) => {
      return data.name.toLowerCase().includes(filter);
    };
  }

  ngOnInit(): void {
    this.loadOrganizations();
  }

  ngAfterViewInit(): void {
    // Set paginator to dataSource after view initialization
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }

  loadOrganizations(): void {
    this.loading = true;
    this.organizationsService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
        this.dataSource.data = orgs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading organizations:', err);
        this.loading = false;
      }
    });
  }

  filterOrganizations(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    // Reset to first page when filtering
    if (this.paginator) {
      this.paginator.firstPage();
    }
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

  viewOrganization(org: Organization): void {
    this.router.navigate(['/organizations', org.id]);
  }

  syncTrakIntel(): void {
    this.syncing = true;
    this.organizationsService.syncFromTrakIntel().subscribe({
      next: (result) => {
        this.syncing = false;
        this.snackBar.open(
          `Synced ${result.total} organizations (${result.created} created, ${result.updated} updated)`,
          'Close',
          { duration: 5000 }
        );
        this.loadOrganizations();
      },
      error: (err) => {
        console.error('Error syncing organizations:', err);
        this.syncing = false;
        this.snackBar.open(
          err.error?.detail || 'Failed to sync organizations from TrakIntel',
          'Close',
          { duration: 5000 }
        );
      }
    });
  }
}
