import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-password-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>lock</mat-icon>
      Confirm Password
    </h2>

    <mat-dialog-content>
      <p class="warning-text">
        <mat-icon class="warning-icon">warning</mat-icon>
        You are about to change menu access levels. This requires System Admin privileges.
      </p>

      <p class="info-text">
        Please enter your password to confirm this action.
      </p>

      <form [formGroup]="passwordForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Your Password</mat-label>
          <input
            matInput
            [type]="hidePassword ? 'password' : 'text'"
            formControlName="password"
            autocomplete="current-password"
            (keyup.enter)="onSubmit()"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hidePassword = !hidePassword"
            [attr.aria-label]="'Hide password'"
            [attr.aria-pressed]="hidePassword"
          >
            <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="passwordForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
        </mat-form-field>

        <p *ngIf="error" class="error-message">
          <mat-icon>error</mat-icon>
          {{ error }}
        </p>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="loading">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="passwordForm.invalid || loading"
      >
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">Confirm</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #d32f2f;
    }

    .warning-text {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #fff3cd;
      border-left: 4px solid #ff9800;
      margin: 0 0 16px 0;
      color: #856404;
      font-weight: 500;
    }

    .warning-icon {
      color: #ff9800;
    }

    .info-text {
      margin: 0 0 20px 0;
      color: #666;
      font-size: 14px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-dialog-content {
      min-width: 400px;
      padding: 24px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d32f2f;
      margin-top: 16px;
      padding: 12px;
      background-color: #ffebee;
      border-radius: 4px;
      font-size: 14px;
    }

    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class PasswordConfirmationDialogComponent {
  passwordForm: FormGroup;
  loading = false;
  error = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PasswordConfirmationDialogComponent>
  ) {
    this.passwordForm = this.fb.group({
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    const password = this.passwordForm.get('password')?.value;
    this.dialogRef.close(password);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
