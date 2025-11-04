import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

interface User {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

@Component({
  selector: 'app-advice-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Ask for Advice</h2>
    <div mat-dialog-content>
      <p *ngIf="data.testCaseId" class="test-case-info">
        <strong>Test Case:</strong> #{{ data.testCaseId }}
        <span *ngIf="data.testCaseTitle"> - {{ data.testCaseTitle }}</span>
      </p>

      <mat-form-field appearance="outline" class="full-width" *ngIf="!data.testCaseId">
        <mat-label>Test Case ID</mat-label>
        <input matInput type="number" [(ngModel)]="formData.test_case_id" required>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Ask who?</mat-label>
        <mat-select [(ngModel)]="formData.asked_to_id" required>
          <mat-option *ngFor="let user of users" [value]="user.id">
            {{ getUserDisplayName(user) }}
          </mat-option>
        </mat-select>
        <mat-hint>Select the person you want to ask for advice</mat-hint>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Your Question</mat-label>
        <textarea
          matInput
          [(ngModel)]="formData.question_text"
          rows="6"
          placeholder="Describe your question or issue in detail..."
          required
        ></textarea>
        <mat-hint>Be specific about what you need help with</mat-hint>
      </mat-form-field>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="!isFormValid() || isSubmitting"
      >
        <mat-spinner *ngIf="isSubmitting" diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
        {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
      </button>
    </div>
  `,
  styles: [`
    .test-case-info {
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .error-message {
      padding: 12px;
      background-color: #ffebee;
      color: #c62828;
      border-radius: 4px;
      margin-top: 8px;
      font-size: 14px;
    }
  `]
})
export class AdviceFormComponent implements OnInit {
  formData = {
    test_case_id: 0,
    question_text: '',
    asked_to_id: 0
  };
  users: User[] = [];
  isSubmitting = false;
  errorMessage = '';
  currentUser: any;

  constructor(
    public dialogRef: MatDialogRef<AdviceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.currentUserValue;

    // Pre-fill test case ID if provided
    if (data.testCaseId) {
      this.formData.test_case_id = data.testCaseId;
    }
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<User[]>('http://localhost:8000/api/users').subscribe({
      next: (users) => {
        // Filter out current user (can't ask yourself)
        this.users = users.filter(u => u.id !== this.currentUser?.id);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.errorMessage = 'Failed to load users. Please try again.';
      }
    });
  }

  getUserDisplayName(user: User): string {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name} (${user.username})`;
    }
    return user.username;
  }

  isFormValid(): boolean {
    return (
      this.formData.test_case_id > 0 &&
      this.formData.asked_to_id > 0 &&
      this.formData.question_text.trim().length > 0
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      test_case_id: this.formData.test_case_id,
      question_text: this.formData.question_text.trim(),
      asked_by_id: this.currentUser?.id || 1,
      asked_to_id: this.formData.asked_to_id
    };

    this.http.post('http://localhost:8000/api/advice', payload).subscribe({
      next: (response) => {
        this.dialogRef.close(response);
      },
      error: (err) => {
        console.error('Error creating advice:', err);
        this.errorMessage = err.error?.detail || 'Failed to create advice request. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
