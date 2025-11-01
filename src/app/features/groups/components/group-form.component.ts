import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupsService } from '../services/groups.service';
import { Group, GroupCreate, GroupUpdate } from '../models/group.model';

@Component({
  selector: 'app-group-form',
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
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Group' : 'Create Group' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
          <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Group Type</mat-label>
          <mat-select formControlName="group_type">
            <mat-option value="internal">Internal</mat-option>
            <mat-option value="customer">Customer</mat-option>
            <mat-option value="contractor">Contractor</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('group_type')?.hasError('required')">Type is required</mat-error>
        </mat-form-field>

        <mat-checkbox formControlName="is_active" class="full-width">Active</mat-checkbox>

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
    mat-dialog-content { min-height: 300px; max-height: 70vh; overflow-y: auto; }
    .error-message { color: #d32f2f; margin-top: 16px; }
    mat-spinner { display: inline-block; margin-right: 8px; }
  `]
})
export class GroupFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private groupsService: GroupsService,
    private dialogRef: MatDialogRef<GroupFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Group | null
  ) {
    this.isEditMode = !!data;
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      group_type: ['internal', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        description: this.data.description || '',
        group_type: this.data.group_type,
        is_active: this.data.is_active
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const request = this.isEditMode && this.data
      ? this.groupsService.updateGroup(this.data.id, this.form.value)
      : this.groupsService.createGroup(this.form.value);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        console.error('Error saving group:', err);
        this.error = err.error?.error?.message || 'Failed to save group.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
