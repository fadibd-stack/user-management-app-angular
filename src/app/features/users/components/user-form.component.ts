import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsersService } from '../services/users.service';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserCreate, UserUpdate } from '../models/user.model';
import { Organization } from '../../organizations/models/organization.model';
import { ApiService } from '../../../core/services/api.service';

interface Language {
  code: string;
  name: string;
}

interface Timezone {
  value: string;
  label: string;
}

const COMMON_TIMEZONES: Timezone[] = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' }
];

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Employee' : 'Create New Employee' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <!-- Username -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Username *</mat-label>
          <input matInput formControlName="username" [readonly]="isEditMode" />
          <mat-error *ngIf="userForm.get('username')?.hasError('required')">
            Username is required
          </mat-error>
        </mat-form-field>


        <!-- Email -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email *</mat-label>
          <input matInput type="email" formControlName="email" />
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">
            Invalid email format
          </mat-error>
        </mat-form-field>

        <!-- First Name -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>First Name *</mat-label>
          <input matInput formControlName="first_name" />
          <mat-error *ngIf="userForm.get('first_name')?.hasError('required')">
            First name is required
          </mat-error>
        </mat-form-field>

        <!-- Last Name -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Last Name *</mat-label>
          <input matInput formControlName="last_name" />
          <mat-error *ngIf="userForm.get('last_name')?.hasError('required')">
            Last name is required
          </mat-error>
        </mat-form-field>

        <!-- Password (only for create) -->
        <mat-form-field *ngIf="!isEditMode" appearance="outline" class="full-width">
          <mat-label>Password *</mat-label>
          <input matInput type="password" formControlName="password" />
          <mat-error *ngIf="userForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
          <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
            Password must be at least 3 characters
          </mat-error>
        </mat-form-field>

        <!-- Language -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Language *</mat-label>
          <mat-select formControlName="language">
            <mat-option *ngFor="let lang of languages" [value]="lang.code">
              {{ lang.name }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="userForm.get('language')?.hasError('required')">
            Language is required
          </mat-error>
        </mat-form-field>

        <!-- Timezone -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Timezone *</mat-label>
          <mat-select formControlName="timezone">
            <mat-option value="">-- Select Timezone --</mat-option>
            <mat-option *ngFor="let tz of timezones" [value]="tz.value">
              {{ tz.label }}
            </mat-option>
          </mat-select>
          <mat-hint>User's timezone preference for displaying dates and times</mat-hint>
          <mat-error *ngIf="userForm.get('timezone')?.hasError('required')">
            Timezone is required
          </mat-error>
        </mat-form-field>

        <!-- Contact Fields (for customer users only) -->
        <div *ngIf="userType === 'customer'" class="roles-section">
          <label class="section-label">Access Level</label>
          <p class="section-hint">Contact will be added to your organization</p>

          <!-- Org Admin Checkbox -->
          <mat-checkbox formControlName="is_org_admin" class="role-checkbox">
            Organization Administrator
            <span class="role-description">Can manage users and settings within the organization</span>
          </mat-checkbox>
        </div>

        <!-- Employee Roles (checkboxes for InterSystems employees only) -->
        <div *ngIf="userType === 'intersystems'" class="roles-section">
          <label class="section-label">Employee Roles</label>
          <p class="section-hint">Select one or more roles for this employee (no selection = Standard Employee)</p>

          <mat-checkbox formControlName="is_system_admin" class="role-checkbox">
            System Administrator
            <span class="role-description">Full system access and administrative privileges</span>
          </mat-checkbox>

          <mat-checkbox formControlName="is_manager" class="role-checkbox">
            Manager
            <span class="role-description">Team management and oversight responsibilities</span>
          </mat-checkbox>

          <mat-checkbox formControlName="is_product_manager" class="role-checkbox">
            Product Manager
            <span class="role-description">Product development and strategy</span>
          </mat-checkbox>
        </div>

        <!-- Permission Warning -->
        <div *ngIf="permissionWarning" class="warning-box">
          {{ permissionWarning }}
        </div>

        <!-- Active Status -->
        <mat-checkbox formControlName="is_active" class="full-width">
          Active User
        </mat-checkbox>

        <!-- Classic Menu Preference -->
        <div class="full-width" style="margin-top: 8px;">
          <mat-checkbox formControlName="use_classic_menu">
            Use Classic Menu
          </mat-checkbox>
          <div class="menu-hint">Enable simple list menu style instead of collapsible groups</div>
        </div>

        <p *ngIf="error" class="error-message">{{ error }}</p>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="userForm.invalid || loading">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">{{ isEditMode ? 'Update' : 'Create' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 4px;
    }

    .user-form {
      padding-top: 8px;
    }

    mat-dialog-content {
      min-height: 500px;
      max-height: 75vh;
      overflow-y: auto;
      padding: 24px;
      padding-bottom: 40px;
    }

    .error-message {
      color: #d32f2f;
      margin-top: 16px;
    }

    .warning-box {
      margin: 16px 0;
      padding: 12px 16px;
      background-color: #fff3e0;
      color: #e65100;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      border: 1px solid #ffb74d;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    .menu-hint {
      display: block;
      margin-top: -8px;
      margin-bottom: 16px;
      margin-left: 32px;
      font-size: 12px;
      color: #666;
    }

    .user-type-section {
      margin-bottom: 16px;
      padding: 8px 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }

    .user-type-radio-group {
      display: flex;
      gap: 12px;
    }

    .user-type-radio {
      flex: 1;
    }

    .roles-section {
      margin: 16px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .section-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #1976d2;
      margin-bottom: 4px;
    }

    .section-hint {
      font-size: 12px;
      color: #666;
      margin: 0 0 12px 0;
    }

    .role-checkbox {
      display: flex !important;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 12px;
      padding: 8px 0;
    }

    .role-description {
      display: block;
      font-size: 11px;
      color: #666;
      margin-left: 28px;
      margin-top: 2px;
      font-style: italic;
    }
  `]
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  isSuperuser = false;
  languages: Language[] = [];
  organizations: Organization[] = [];
  timezones = COMMON_TIMEZONES;
  permissionWarning = '';
  userType: 'customer' | 'intersystems' = 'intersystems';

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private authService: AuthService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Check if this is actually edit mode (has user data, not just create mode marker)
    this.isEditMode = !!(data && !data._createMode);
    const currentUser = this.authService.currentUserValue;
    this.isSuperuser = currentUser?.is_superuser || false;

    this.userForm = this.fb.group({
      username: [{ value: '', disabled: this.isEditMode }, Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      language: ['en', Validators.required],
      timezone: ['', Validators.required],
      user_role: ['InterSystems', Validators.required],
      permission_level: ['user', Validators.required],
      organization_id: [null],  // Will be made required for contacts
      // Employee role checkboxes
      is_system_admin: [false],
      is_manager: [false],
      is_product_manager: [false],
      // Contact role checkbox
      is_org_admin: [false],
      is_active: [true],
      use_classic_menu: [false]
    });

    // Listen to permission level changes for validation
    this.userForm.get('permission_level')?.valueChanges.subscribe(() => {
      this.validatePermissions();
    });
  }

  ngOnInit(): void {
    // Load languages
    this.apiService.get<Language[]>('/api/languages').subscribe({
      next: (langs) => this.languages = langs,
      error: (err) => console.error('Error loading languages:', err)
    });

    // Load organizations (for contact form)
    this.organizationsService.getOrganizations().subscribe({
      next: (orgs) => this.organizations = orgs,
      error: (err) => console.error('Error loading organizations:', err)
    });

    if (this.data) {
      // Check if this is create mode with a specified user type
      if (this.data._createMode && this.data._userType) {
        this.userType = this.data._userType === 'contact' ? 'customer' : 'intersystems';
        console.log('Create mode - Setting userType to:', this.userType);
        // Don't patch form values in create mode
        return;
      }

      // Edit mode - Set userType based on user_type
      console.log('Edit mode - User data:', this.data);
      console.log('User type from data:', this.data.user_type);
      console.log('is_system_admin from data:', this.data.is_system_admin);
      console.log('is_manager from data:', this.data.is_manager);
      console.log('is_product_manager from data:', this.data.is_product_manager);
      this.userType = this.data.user_type === 'employee' ? 'intersystems' : 'customer';
      console.log('Set userType to:', this.userType);

      this.userForm.patchValue({
        username: this.data.username,
        email: this.data.email,
        first_name: this.data.first_name,
        last_name: this.data.last_name,
        language: this.data.language || 'en',
        timezone: this.data.timezone || '',
        user_role: this.data.user_role || 'Customer',
        permission_level: this.data.permission_level,
        organization_id: this.data.organization_id || null,
        // Employee role checkboxes
        is_system_admin: this.data.is_system_admin || false,
        is_manager: this.data.is_manager || false,
        is_product_manager: this.data.is_product_manager || false,
        // Contact role checkbox
        is_org_admin: this.data.is_org_admin || false,
        is_active: this.data.is_active,
        use_classic_menu: this.data.use_classic_menu ?? false
      });

      console.log('Form value after patching:', this.userForm.value);
    }
  }

  validatePermissions(): void {
    const permissionLevel = this.userForm.get('permission_level')?.value;

    if (permissionLevel === 'system_admin' && this.userType !== 'intersystems') {
      this.permissionWarning = '⚠️ System Admin permission is restricted to InterSystems staff only';
    } else {
      this.permissionWarning = '';
    }
  }

  onUserTypeChange(): void {
    console.log('[TIMESTAMP: ' + new Date().toISOString() + '] User type changed to:', this.userType);

    // Update user_role based on user type selection
    this.userForm.patchValue({
      user_role: this.userType === 'intersystems' ? 'InterSystems' : 'Customer'
    });

    if (this.userType === 'intersystems') {
      // InterSystems employees don't need an organization - clear it
      this.userForm.patchValue({
        organization_id: null
      });
    } else {
      // Customer user type - reset role checkboxes
      this.userForm.patchValue({
        is_system_admin: false,
        is_manager: false,
        is_product_manager: false,
        permission_level: 'user'
      });
    }
  }

  onSubmit(): void {
    console.log('[TIMESTAMP: ' + new Date().toISOString() + '] onSubmit called');

    if (this.userForm.invalid) {
      console.error('Form is invalid:', this.userForm.errors);
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.isEditMode && this.data) {
      // Update existing user - don't send username (it's disabled and shouldn't change)
      const formValue = this.userForm.getRawValue();
      const { username, password, ...updateData } = formValue;  // Exclude username and password

      this.usersService.updateUser(this.data.id, updateData as UserUpdate).subscribe({
        next: (updatedUser) => {
          // If the updated user is the current logged-in user, refresh the auth service
          const currentUser = this.authService.currentUserValue;
          if (currentUser && this.data && currentUser.id === this.data.id) {
            this.authService.updateCurrentUser(updatedUser);
          }
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error updating user:', err);
          this.error = err.error?.detail || err.error?.error?.message || 'Failed to update user. Please try again.';
          this.loading = false;
        }
      });
    } else {
      // Create new user - determine user_type from userType
      const formValue = this.userForm.value;
      const createData: UserCreate = {
        ...formValue,
        username: this.userForm.get('username')?.value,
        user_type: this.userType === 'intersystems' ? 'employee' : 'contact'
      };

      // For contacts, auto-assign the organization_id from current user
      if (this.userType === 'customer') {
        const currentUser = this.authService.currentUserValue;
        if (currentUser?.organization_id) {
          createData.organization_id = currentUser.organization_id;
        }
      }

      this.usersService.createUser(createData).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error creating user:', err);
          console.error('Full error object:', JSON.stringify(err, null, 2));
          this.error = err.error?.detail || err.error?.error?.message || 'Failed to create user. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
