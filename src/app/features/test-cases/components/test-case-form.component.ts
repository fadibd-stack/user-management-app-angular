import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TestCasesService } from '../services/test-cases.service';
import { TestCase, TestCaseCreate, TestCaseUpdate, SystemArea } from '../models/test-case.model';

@Component({
  selector: 'app-test-case-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Test Case' : 'Create New Test Case' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="testCaseForm">
        <!-- Title -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
          <mat-error *ngIf="testCaseForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <!-- Description -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
        </mat-form-field>

        <!-- System Area -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>System Area</mat-label>
          <mat-select formControlName="system_area_id">
            <mat-option [value]="null">None</mat-option>
            <mat-option *ngFor="let area of systemAreas" [value]="area.id">
              {{ area.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div class="form-row">
          <!-- Status -->
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="new">New</mat-option>
              <mat-option value="in_review">In Review</mat-option>
              <mat-option value="in_progress">In Progress</mat-option>
              <mat-option value="completed">Completed</mat-option>
              <mat-option value="blocked">Blocked</mat-option>
              <mat-option value="failed">Failed</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Priority -->
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="critical">Critical</mat-option>
              <mat-option value="high">High</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="low">Low</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <!-- Test Type -->
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Test Type</mat-label>
            <mat-select formControlName="test_type">
              <mat-option value="functional">Functional</mat-option>
              <mat-option value="integration">Integration</mat-option>
              <mat-option value="regression">Regression</mat-option>
              <mat-option value="performance">Performance</mat-option>
              <mat-option value="security">Security</mat-option>
              <mat-option value="uat">User Acceptance</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Complexity -->
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Complexity</mat-label>
            <mat-select formControlName="complexity">
              <mat-option value="simple">Simple</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="complex">Complex</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Expected Result -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Expected Result</mat-label>
          <textarea matInput formControlName="expected_result" rows="3"></textarea>
        </mat-form-field>

        <!-- Actual Result (only for edit mode) -->
        <mat-form-field *ngIf="isEditMode" appearance="outline" class="full-width">
          <mat-label>Actual Result</mat-label>
          <textarea matInput formControlName="actual_result" rows="3"></textarea>
        </mat-form-field>

        <!-- Test Notes (only for edit mode) -->
        <mat-form-field *ngIf="isEditMode" appearance="outline" class="full-width">
          <mat-label>Test Notes</mat-label>
          <textarea matInput formControlName="test_notes" rows="3"></textarea>
        </mat-form-field>

        <!-- Due Date -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Due Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="due_date">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <!-- Checkboxes -->
        <div class="checkboxes">
          <mat-checkbox formControlName="is_automatic_change">
            Automatic Change
          </mat-checkbox>
          <mat-checkbox formControlName="is_regulatory">
            Regulatory
          </mat-checkbox>
        </div>

        <p *ngIf="error" class="error-message">{{ error }}</p>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="testCaseForm.invalid || loading">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">{{ isEditMode ? 'Update' : 'Create' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .half-width {
      flex: 1;
    }

    .checkboxes {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    mat-dialog-content {
      min-height: 400px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .error-message {
      color: #d32f2f;
      margin-top: 16px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class TestCaseFormComponent implements OnInit {
  testCaseForm: FormGroup;
  systemAreas: SystemArea[] = [];
  loading = false;
  error = '';
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private testCasesService: TestCasesService,
    private dialogRef: MatDialogRef<TestCaseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TestCase | null
  ) {
    this.isEditMode = !!data;

    this.testCaseForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      system_area_id: [null],
      status: ['new'],
      priority: ['medium'],
      test_type: ['functional'],
      complexity: ['medium'],
      expected_result: [''],
      actual_result: [''],
      test_notes: [''],
      due_date: [null],
      is_automatic_change: [false],
      is_regulatory: [false]
    });
  }

  ngOnInit(): void {
    this.loadSystemAreas();

    if (this.data) {
      this.testCaseForm.patchValue({
        title: this.data.title,
        description: this.data.description || '',
        system_area_id: this.data.system_area_id || null,
        status: this.data.status,
        priority: this.data.priority,
        test_type: this.data.test_type,
        complexity: this.data.complexity,
        expected_result: this.data.expected_result || '',
        actual_result: this.data.actual_result || '',
        test_notes: this.data.test_notes || '',
        due_date: this.data.due_date ? new Date(this.data.due_date) : null,
        is_automatic_change: this.data.is_automatic_change,
        is_regulatory: this.data.is_regulatory
      });
    }
  }

  loadSystemAreas(): void {
    this.testCasesService.getSystemAreas().subscribe({
      next: (areas) => {
        this.systemAreas = areas;
      },
      error: (err) => {
        console.error('Error loading system areas:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.testCaseForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const formValue = this.testCaseForm.value;
    const payload = {
      ...formValue,
      due_date: formValue.due_date ? formValue.due_date.toISOString().split('T')[0] : null
    };

    if (this.isEditMode && this.data) {
      // Update existing test case
      const updateData: TestCaseUpdate = payload;
      this.testCasesService.updateTestCase(this.data.id, updateData).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error updating test case:', err);
          this.error = err.error?.error?.message || 'Failed to update test case. Please try again.';
          this.loading = false;
        }
      });
    } else {
      // Create new test case
      const createData: TestCaseCreate = payload;
      this.testCasesService.createTestCase(createData).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error creating test case:', err);
          this.error = err.error?.error?.message || 'Failed to create test case. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
