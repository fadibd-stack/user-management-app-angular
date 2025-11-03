import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CodeTablesService } from '../services/code-tables.service';
import { CodeTableType, CodeTableValue } from '../models/code-table.model';
import { CodeTableValueFormComponent } from './code-table-value-form.component';

@Component({
  selector: 'app-code-tables-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  template: `
    <div class="code-tables-container">
      <div class="page-header" *ngIf="!hideHeader">
        <div>
          <h2>{{ getSelectedTypeName() }}</h2>
          <p>Manage {{ getSelectedTypeName() | lowercase }} values</p>
        </div>
        <button mat-raised-button color="primary" (click)="openDialog()" [disabled]="!selectedType">
          <mat-icon>add</mat-icon>
          Add Value
        </button>
      </div>

      <div class="add-button-row" *ngIf="hideHeader">
        <button mat-raised-button color="primary" (click)="openDialog()" [disabled]="!selectedType">
          <mat-icon>add</mat-icon>
          Add Value
        </button>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
      </mat-card>

      <mat-card *ngIf="!loading && selectedType" class="table-card">
        <table mat-table [dataSource]="values" class="code-table">
          <ng-container matColumnDef="display_order">
            <th mat-header-cell *matHeaderCellDef>Order</th>
            <td mat-cell *matCellDef="let value">{{ value.display_order }}</td>
          </ng-container>

          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let value">{{ value.code }}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let value">
              <span *ngIf="value.icon">{{ value.icon }}</span>
              {{ value.name }}
            </td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let value">{{ value.description || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="color">
            <th mat-header-cell *matHeaderCellDef>Color</th>
            <td mat-cell *matCellDef="let value">
              <div *ngIf="value.color" class="color-box" [style.background-color]="value.color"></div>
              <span *ngIf="!value.color">-</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="is_default">
            <th mat-header-cell *matHeaderCellDef>Default</th>
            <td mat-cell *matCellDef="let value">
              <mat-chip *ngIf="value.is_default" class="default-chip">Default</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="is_active">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let value">
              <mat-chip [class.active-chip]="value.is_active"
                        [class.inactive-chip]="!value.is_active">
                {{ value.is_active ? 'Active' : 'Inactive' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let value">
              <button mat-icon-button (click)="editValue(value)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteValue(value)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <p *ngIf="values.length === 0" class="no-data">No values found for this table type</p>
      </mat-card>

      <mat-card *ngIf="!loading && !selectedType" class="info-card">
        <p>Please select a code table type to view and manage values.</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .code-tables-container { padding: 24px; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .page-header h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; }
    .page-header p { margin: 0; color: #666; }
    .filter-card { margin-bottom: 16px; padding: 16px; }
    .add-button-row { display: flex; justify-content: flex-end; margin-bottom: 16px; }
    .type-select { width: 100%; max-width: 400px; }
    .table-card, .loading-card, .info-card { margin-top: 16px; }
    .loading-card { display: flex; justify-content: center; padding: 48px; }
    .info-card { padding: 48px; text-align: center; color: #666; }
    .code-table { width: 100%; }
    .no-data { text-align: center; padding: 48px; color: #999; }
    .color-box {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    .default-chip { background-color: #e3f2fd; color: #1976d2; }
    .active-chip { background-color: #e8f5e9; color: #388e3c; }
    .inactive-chip { background-color: #ffebee; color: #d32f2f; }
  `]
})
export class CodeTablesListComponent implements OnInit {
  @Input() tableId?: number;
  @Input() hideHeader: boolean = false;

  types: CodeTableType[] = [];
  values: CodeTableValue[] = [];
  selectedType: string = '';
  loading = true;
  displayedColumns: string[] = ['display_order', 'code', 'name', 'description', 'color', 'is_default', 'is_active', 'actions'];

  constructor(
    private codeTablesService: CodeTablesService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.codeTablesService.getTypes().subscribe({
      next: (types) => {
        this.types = types.filter(t => t.is_active);

        // If tableId is provided as input, use it directly
        if (this.tableId) {
          const matchedType = this.types.find(t => t.id === this.tableId);
          if (matchedType) {
            this.selectedType = matchedType.code;
            this.loadValues();
          }
        } else {
          // Subscribe to query parameter changes
          this.route.queryParams.subscribe(params => {
            const tableParam = params['table'];

            if (tableParam) {
              // If table param exists, use it
              const matchedType = this.types.find(t => t.id === parseInt(tableParam) || t.code === tableParam);
              if (matchedType) {
                this.selectedType = matchedType.code;
              } else if (this.types.length > 0) {
                this.selectedType = this.types[0].code;
              }
            } else if (this.types.length > 0) {
              this.selectedType = this.types[0].code;
            }

            if (this.selectedType) {
              this.loadValues();
            }
          });
        }
      },
      error: (err) => console.error('Error loading types:', err)
    });
  }

  onTypeChange(): void {
    this.loadValues();
  }

  getSelectedTypeName(): string {
    if (!this.selectedType) return 'Code Tables';
    const type = this.types.find(t => t.code === this.selectedType);
    return type ? type.name : 'Code Tables';
  }

  loadValues(): void {
    if (!this.selectedType) return;

    this.loading = true;
    this.codeTablesService.getValues(this.selectedType).subscribe({
      next: (values) => {
        this.values = values.sort((a, b) => a.display_order - b.display_order);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading values:', err);
        this.loading = false;
      }
    });
  }

  openDialog(value?: CodeTableValue): void {
    const selectedTypeObj = this.types.find(t => t.code === this.selectedType);
    const dialogRef = this.dialog.open(CodeTableValueFormComponent, {
      width: '600px',
      data: { value: value || null, type: selectedTypeObj }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadValues();
    });
  }

  editValue(value: CodeTableValue): void {
    this.openDialog(value);
  }

  deleteValue(value: CodeTableValue): void {
    if (confirm(`Delete code table value "${value.name}"?`)) {
      this.codeTablesService.deleteValue(value.id).subscribe({
        next: () => this.loadValues(),
        error: (err) => {
          console.error('Error deleting value:', err);
          alert('Failed to delete value.');
        }
      });
    }
  }
}
