import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Edition } from '../models/edition.model';

export interface EditionDialogData {
  edition?: Edition;
  mode: 'add' | 'edit';
}

@Component({
  selector: 'app-edition-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Edition' : 'Edit Edition' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="editionForm" class="edition-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Code *</mat-label>
          <input matInput formControlName="code" placeholder="e.g., MEXX" maxlength="10">
          <mat-hint>Unique edition code (uppercase recommended)</mat-hint>
          <mat-error *ngIf="editionForm.get('code')?.hasError('required')">
            Code is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name *</mat-label>
          <input matInput formControlName="name" placeholder="e.g., Middle East Edition">
          <mat-error *ngIf="editionForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Optional description"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Display Order</mat-label>
          <input matInput type="number" formControlName="display_order" placeholder="0">
          <mat-hint>Lower numbers appear first</mat-hint>
        </mat-form-field>

        <div class="checkbox-field">
          <mat-checkbox formControlName="is_active">Active</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!editionForm.valid">
        {{ data.mode === 'add' ? 'Add' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edition-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
      padding-top: 8px;
    }

    .full-width {
      width: 100%;
    }

    .checkbox-field {
      padding: 8px 0;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
    }
  `]
})
export class EditionDialogComponent {
  editionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditionDialogData
  ) {
    this.editionForm = this.fb.group({
      code: [data.edition?.code || '', Validators.required],
      name: [data.edition?.name || '', Validators.required],
      description: [data.edition?.description || ''],
      display_order: [data.edition?.display_order ?? 0],
      is_active: [data.edition?.is_active ?? true]
    });

    // Disable code field when editing (codes should not change)
    if (data.mode === 'edit') {
      this.editionForm.get('code')?.disable();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editionForm.valid) {
      const formValue = this.editionForm.getRawValue(); // getRawValue includes disabled fields
      this.dialogRef.close(formValue);
    }
  }
}
