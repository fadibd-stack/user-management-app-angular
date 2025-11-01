import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Country } from '../models/country.model';

export interface CountryDialogData {
  country?: Country;
  mode: 'add' | 'edit';
}

@Component({
  selector: 'app-country-dialog',
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
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Country' : 'Edit Country' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="countryForm" class="country-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Code *</mat-label>
          <input matInput formControlName="code" placeholder="e.g., US" />
          <mat-error *ngIf="countryForm.get('code')?.hasError('required')">
            Code is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name *</mat-label>
          <input matInput formControlName="name" placeholder="e.g., United States" />
          <mat-error *ngIf="countryForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>

        <mat-checkbox formControlName="is_active" class="full-width">
          Active
        </mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="countryForm.invalid">
        {{ data.mode === 'add' ? 'Create' : 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .country-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
      padding-top: 8px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      padding: 20px 24px;
    }
  `]
})
export class CountryDialogComponent implements OnInit {
  countryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CountryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CountryDialogData
  ) {
    this.countryForm = this.fb.group({
      code: [data.country?.code || '', Validators.required],
      name: [data.country?.name || '', Validators.required],
      is_active: [data.country?.is_active ?? true]
    });

    // Disable code field when editing
    if (data.mode === 'edit') {
      this.countryForm.get('code')?.disable();
    }
  }

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.countryForm.valid) {
      this.dialogRef.close(this.countryForm.getRawValue());
    }
  }
}
