import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CountriesService } from '../services/countries.service';
import { Country, CountryCreate, CountryUpdate } from '../models/country.model';
import { CountryDialogComponent, CountryDialogData } from './country-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Component({
  selector: 'app-countries-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="countries-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Countries</h2>
            <p>Manage country master data</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="addCountry()">
              <mat-icon>add</mat-icon>
              Add Country
            </button>
          </div>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
        <p>Loading countries...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="countries" class="full-width-table">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>CODE</th>
            <td mat-cell *matCellDef="let country">
              <span class="code-badge">{{ country.code }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>NAME</th>
            <td mat-cell *matCellDef="let country">{{ country.name }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let country">
              <mat-chip class="status-chip" [class.active-chip]="country.is_active">
                {{ country.is_active ? 'ACTIVE' : 'INACTIVE' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
            <td mat-cell *matCellDef="let country">
              <button mat-button (click)="editCountry(country)">Edit</button>
              <button mat-button color="warn" (click)="deleteCountry(country)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="countries.length === 0" class="no-data">
          <mat-icon class="no-data-icon">public</mat-icon>
          <p>No countries found</p>
          <p class="no-data-hint">Click "Add Country" to create one</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .countries-container { padding: 24px; }
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
    }

    .no-data-hint {
      font-size: 14px !important;
      color: #999 !important;
    }
  `]
})
export class CountriesListComponent implements OnInit {
  countries: Country[] = [];
  loading = true;
  displayedColumns = ['code', 'name', 'status', 'actions'];

  constructor(
    private countriesService: CountriesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.loading = true;
    this.countriesService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading countries:', err);
        this.snackBar.open('Failed to load countries', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  addCountry(): void {
    const dialogRef = this.dialog.open(CountryDialogComponent, {
      width: '500px',
      data: { mode: 'add' } as CountryDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newCountry: CountryCreate = {
          code: result.code,
          name: result.name,
          is_active: result.is_active
        };

        this.countriesService.createCountry(newCountry).subscribe({
          next: () => {
            this.snackBar.open('Country created successfully', 'Close', { duration: 3000 });
            this.loadCountries();
          },
          error: (err) => {
            console.error('Error creating country:', err);
            this.snackBar.open(err.error?.detail || 'Failed to create country', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  editCountry(country: Country): void {
    const dialogRef = this.dialog.open(CountryDialogComponent, {
      width: '500px',
      data: { country, mode: 'edit' } as CountryDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updateData: CountryUpdate = {
          name: result.name,
          is_active: result.is_active
        };

        this.countriesService.updateCountry(country.id, updateData).subscribe({
          next: () => {
            this.snackBar.open('Country updated successfully', 'Close', { duration: 3000 });
            this.loadCountries();
          },
          error: (err) => {
            console.error('Error updating country:', err);
            this.snackBar.open(err.error?.detail || 'Failed to update country', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  deleteCountry(country: Country): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Country',
        message: `Are you sure you want to delete "${country.name}" (${country.code})? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.countriesService.deleteCountry(country.id).subscribe({
          next: () => {
            this.snackBar.open('Country deleted successfully', 'Close', { duration: 3000 });
            this.loadCountries();
          },
          error: (err) => {
            console.error('Error deleting country:', err);
            this.snackBar.open(err.error?.detail || 'Failed to delete country', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }
}
