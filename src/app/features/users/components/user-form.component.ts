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
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit User' : 'Create New User' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <!-- User Type Selection (only for create mode) -->
        <div *ngIf="!isEditMode" class="user-type-section">
          <mat-radio-group [(ngModel)]="userType" [ngModelOptions]="{standalone: true}" (change)="onUserTypeChange()" class="user-type-radio-group">
            <mat-radio-button value="customer" class="user-type-radio">Customer</mat-radio-button>
            <mat-radio-button value="intersystems" class="user-type-radio">InterSystems Employee</mat-radio-button>
          </mat-radio-group>
        </div>
        <!-- Username -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Username *</mat-label>
          <input matInput formControlName="username" [readonly]="isEditMode" />
          <mat-error *ngIf="userForm.get('username')?.hasError('required')">
            Username is required
          </mat-error>
        </mat-form-field>

        <!-- Organization (only for customers and superusers) -->
        <mat-form-field *ngIf="isSuperuser && (isEditMode || userType === 'customer')" appearance="outline" class="full-width">
          <mat-label>Organization</mat-label>
          <mat-select formControlName="organization_id">
            <mat-option [value]="null">-- Select Organization (Optional for Superusers) --</mat-option>
            <mat-option *ngFor="let org of organizations" [value]="org.id">
              {{ org.name }}
            </mat-option>
          </mat-select>
          <mat-hint>Leave empty to create a superuser without organization (full access)</mat-hint>
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

        <!-- Employment Type (only for superusers) -->
        <mat-form-field *ngIf="isSuperuser" appearance="outline" class="full-width">
          <mat-label>Employment Type *</mat-label>
          <mat-select formControlName="employment_type">
            <mat-option value="customer">Customer</mat-option>
            <mat-option value="intersystems">InterSystems</mat-option>
          </mat-select>
          <mat-hint>Organizational affiliation (label only, doesn't affect permissions)</mat-hint>
          <mat-error *ngIf="userForm.get('employment_type')?.hasError('required')">
            Employment type is required
          </mat-error>
        </mat-form-field>

        <!-- Permission Level -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Permission Level *</mat-label>
          <mat-select formControlName="permission_level">
            <mat-option value="user">User</mat-option>
            <mat-option value="org_admin">Org Admin</mat-option>
            <mat-option *ngIf="isSuperuser" value="system_admin">System Admin</mat-option>
          </mat-select>
          <mat-hint *ngIf="isSuperuser">
            Controls access permissions. System Admin restricted to InterSystems staff.
          </mat-hint>
          <mat-hint *ngIf="!isSuperuser">
            Controls access permissions within your organization.
          </mat-hint>
          <mat-error *ngIf="userForm.get('permission_level')?.hasError('required')">
            Permission level is required
          </mat-error>
        </mat-form-field>

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
  userType: 'customer' | 'intersystems' = 'customer';

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private authService: AuthService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User | null
  ) {
    this.isEditMode = !!data;
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
      employment_type: ['customer', Validators.required],
      permission_level: ['user', Validators.required],
      organization_id: [null],
      is_active: [true],
      use_classic_menu: [false]
    });

    // Listen to permission level and employment type changes for validation
    this.userForm.get('permission_level')?.valueChanges.subscribe(() => this.validatePermissions());
    this.userForm.get('employment_type')?.valueChanges.subscribe(() => this.validatePermissions());
  }

  ngOnInit(): void {
    // Load languages
    this.apiService.get<Language[]>('/api/languages').subscribe({
      next: (langs) => this.languages = langs,
      error: (err) => console.error('Error loading languages:', err)
    });

    // Load organizations (for superusers)
    if (this.isSuperuser) {
      this.organizationsService.getOrganizations().subscribe({
        next: (orgs) => this.organizations = orgs,
        error: (err) => console.error('Error loading organizations:', err)
      });
    }

    if (this.data) {
      this.userForm.patchValue({
        username: this.data.username,
        email: this.data.email,
        first_name: this.data.first_name,
        last_name: this.data.last_name,
        language: this.data.language || 'en',
        timezone: this.data.timezone || '',
        employment_type: this.data.employment_type,
        permission_level: this.data.permission_level,
        organization_id: this.data.organization_id || null,
        is_active: this.data.is_active,
        use_classic_menu: this.data.use_classic_menu ?? false
      });
    }
  }

  validatePermissions(): void {
    const permissionLevel = this.userForm.get('permission_level')?.value;
    const employmentType = this.userForm.get('employment_type')?.value;

    if (permissionLevel === 'system_admin' && employmentType !== 'intersystems') {
      this.permissionWarning = '⚠️ System Admin permission is restricted to InterSystems staff only';
    } else {
      this.permissionWarning = '';
    }
  }

  onUserTypeChange(): void {
    // Update employment_type based on user type selection
    this.userForm.patchValue({
      employment_type: this.userType
    });

    // If InterSystems employee, clear organization (they don't belong to an org)
    if (this.userType === 'intersystems') {
      this.userForm.patchValue({
        organization_id: null
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
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
      // Create new user
      const createData: UserCreate = {
        ...this.userForm.value,
        username: this.userForm.get('username')?.value
      };
      this.usersService.createUser(createData).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error creating user:', err);
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
