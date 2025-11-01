import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Release } from '../models/release.model';

export interface ReleaseDialogData {
  release?: Release;
  mode: 'add' | 'edit';
}

@Component({
  selector: 'app-release-dialog',
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
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Release' : 'Edit Release' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="releaseForm" class="release-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Code *</mat-label>
          <input matInput formControlName="code" placeholder="e.g., T2025.1" maxlength="50">
          <mat-hint>Unique release code</mat-hint>
          <mat-error *ngIf="releaseForm.get('code')?.hasError('required')">
            Code is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name *</mat-label>
          <input matInput formControlName="name" placeholder="e.g., T2025.1">
          <mat-hint>Release name/version</mat-hint>
          <mat-error *ngIf="releaseForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Optional description"></textarea>
        </mat-form-field>

        <div class="checkbox-field">
          <mat-checkbox formControlName="is_active">Active</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!releaseForm.valid">
        {{ data.mode === 'add' ? 'Add' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .release-form {
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
export class ReleaseDialogComponent {
  releaseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReleaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReleaseDialogData
  ) {
    this.releaseForm = this.fb.group({
      code: [data.release?.code || '', Validators.required],
      name: [data.release?.name || '', Validators.required],
      description: [data.release?.description || ''],
      is_active: [data.release?.is_active ?? true]
    });

    // Disable code field when editing (codes should not change)
    if (data.mode === 'edit') {
      this.releaseForm.get('code')?.disable();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.releaseForm.valid) {
      const formValue = this.releaseForm.getRawValue(); // getRawValue includes disabled fields
      this.dialogRef.close(formValue);
    }
  }
}
