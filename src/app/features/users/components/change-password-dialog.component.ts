import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from '../services/users.service';
import { User } from '../models/user.model';

export interface ChangePasswordDialogData {
  user: User;
}

@Component({
  selector: 'app-change-password-dialog',
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
      <mat-icon>lock_reset</mat-icon>
      Change Password for {{ data.user.username }}
    </h2>

    <mat-dialog-content>
      <p class="info-text">
        Set a new password for <strong>{{ data.user.first_name }} {{ data.user.last_name }}</strong>
      </p>

      <form [formGroup]="passwordForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New Password *</mat-label>
          <input
            matInput
            [type]="hidePassword ? 'password' : 'text'"
            formControlName="password"
            autocomplete="new-password"
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
          <mat-hint>Minimum 3 characters</mat-hint>
          <mat-error *ngIf="passwordForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
          <mat-error *ngIf="passwordForm.get('password')?.hasError('minlength')">
            Password must be at least 3 characters
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirm New Password *</mat-label>
          <input
            matInput
            [type]="hideConfirmPassword ? 'password' : 'text'"
            formControlName="confirmPassword"
            autocomplete="new-password"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hideConfirmPassword = !hideConfirmPassword"
            [attr.aria-label]="'Hide password'"
            [attr.aria-pressed]="hideConfirmPassword"
          >
            <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
            Please confirm the password
          </mat-error>
          <mat-error *ngIf="passwordForm.hasError('passwordMismatch') && !passwordForm.get('confirmPassword')?.hasError('required')">
            Passwords do not match
          </mat-error>
        </mat-form-field>

        <p *ngIf="error" class="error-message">{{ error }}</p>
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
        <span *ngIf="!loading">Change Password</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .info-text {
      margin: 0 0 20px 0;
      color: #666;
      font-size: 14px;
    }

    mat-dialog-content {
      min-width: 400px;
      padding: 24px;
    }

    .error-message {
      color: #d32f2f;
      margin-top: 16px;
      padding: 12px;
      background-color: #ffebee;
      border-radius: 4px;
      font-size: 14px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class ChangePasswordDialogComponent {
  passwordForm: FormGroup;
  loading = false;
  error = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(3)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const updateData = {
      password: this.passwordForm.get('password')?.value
    };

    this.usersService.updateUser(this.data.user.id, updateData, this.data.user.user_type as 'employee' | 'contact').subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error changing password:', err);
        this.error = err.error?.detail || err.error?.error?.message || 'Failed to change password. Please try again.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
