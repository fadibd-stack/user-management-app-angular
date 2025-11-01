import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CodeTablesService } from '../services/code-tables.service';
import { CodeTableType, CodeTableValue, CodeTableValueCreate, CodeTableValueUpdate } from '../models/code-table.model';

@Component({
  selector: 'app-code-table-value-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit' : 'Create' }} {{ data.type.name }} Value</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Code</mat-label>
          <input matInput formControlName="code" />
          <mat-error *ngIf="form.get('code')?.hasError('required')">Code is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
          <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Icon (emoji)</mat-label>
          <input matInput formControlName="icon" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Color (hex)</mat-label>
          <input matInput formControlName="color" placeholder="#FF5733" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Display Order</mat-label>
          <input matInput type="number" formControlName="display_order" />
        </mat-form-field>

        <div class="checkboxes">
          <mat-checkbox formControlName="is_default">Set as Default</mat-checkbox>
          <mat-checkbox formControlName="is_active">Active</mat-checkbox>
        </div>

        <p *ngIf="error" class="error-message">{{ error }}</p>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || loading">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">{{ isEditMode ? 'Update' : 'Create' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 16px; }
    .checkboxes { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    mat-dialog-content { min-height: 400px; max-height: 70vh; overflow-y: auto; }
    .error-message { color: #d32f2f; margin-top: 16px; }
    mat-spinner { display: inline-block; margin-right: 8px; }
  `]
})
export class CodeTableValueFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private codeTablesService: CodeTablesService,
    private dialogRef: MatDialogRef<CodeTableValueFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { value: CodeTableValue | null; type: CodeTableType }
  ) {
    this.isEditMode = !!data.value;
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      icon: [''],
      color: [''],
      display_order: [1],
      is_default: [false],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    if (this.data.value) {
      this.form.patchValue({
        code: this.data.value.code,
        name: this.data.value.name,
        description: this.data.value.description || '',
        icon: this.data.value.icon || '',
        color: this.data.value.color || '',
        display_order: this.data.value.display_order,
        is_default: this.data.value.is_default,
        is_active: this.data.value.is_active
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const payload = {
      ...this.form.value,
      table_type_id: this.data.type.id
    };

    const request = this.isEditMode && this.data.value
      ? this.codeTablesService.updateValue(this.data.value.id, payload)
      : this.codeTablesService.createValue(payload);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        console.error('Error saving value:', err);
        this.error = err.error?.error?.message || 'Failed to save value.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
