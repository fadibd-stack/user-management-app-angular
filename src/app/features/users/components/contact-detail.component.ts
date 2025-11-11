import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsersService } from '../services/users.service';
import { User } from '../models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="contact-detail-container">
      <!-- Header with back button -->
      <div class="page-header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <div>
            <h2>{{ contact?.username || 'Loading...' }}</h2>
            <p>Contact Details</p>
          </div>
          <div class="header-actions" *ngIf="contact && !loading">
            <button mat-raised-button color="accent" (click)="changePassword()">
              <mat-icon>lock</mat-icon>
              Change Password
            </button>
            <button mat-raised-button color="primary" (click)="deleteContact()">
              <mat-icon>delete</mat-icon>
              Delete Contact
            </button>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <mat-card *ngIf="loading && !error" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading contact details...</p>
      </mat-card>

      <!-- Error state -->
      <mat-card *ngIf="error" class="error-card">
        <mat-icon class="error-icon">error</mat-icon>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="goBack()">Go Back</button>
      </mat-card>

      <!-- Details Card -->
      <mat-card *ngIf="!loading && contact" class="details-card">
        <div class="details-header">
          <div class="header-left">
            <h3>Contact Information</h3>
            <mat-chip class="status-chip header-status" [class.active-chip]="contact.is_active" [color]="contact.is_active ? 'primary' : ''">
              {{ contact.is_active ? 'ACTIVE' : 'INACTIVE' }}
            </mat-chip>
          </div>
          <button mat-raised-button color="primary" (click)="toggleEditMode()">
            <mat-icon>{{ isEditMode ? 'visibility' : 'edit' }}</mat-icon>
            {{ isEditMode ? 'View Mode' : 'Edit Mode' }}
          </button>
        </div>

        <!-- View Mode -->
        <div *ngIf="!isEditMode" class="two-column-layout">
          <!-- Left Column: Basic Information -->
          <div class="left-column">
            <div class="info-item">
              <label>Username</label>
              <span class="code-badge">{{ contact.username }}</span>
            </div>

            <div class="info-item">
              <label>Email</label>
              <span>{{ contact.email }}</span>
            </div>

            <div class="info-item">
              <label>First Name</label>
              <span>{{ contact.first_name || '-' }}</span>
            </div>

            <div class="info-item">
              <label>Last Name</label>
              <span>{{ contact.last_name || '-' }}</span>
            </div>

            <div class="info-item">
              <label>Phone Number</label>
              <span>{{ contact.phone_number || '-' }}</span>
            </div>

            <div class="info-item">
              <label>Organization</label>
              <span>{{ contact.organization_name || '-' }}</span>
            </div>

            <div class="info-item">
              <label>Job Title</label>
              <span>{{ contact.job_title || '-' }}</span>
            </div>
          </div>

          <!-- Right Column: Settings & Roles -->
          <div class="right-column">
            <div class="info-item">
              <label>Language</label>
              <span>{{ contact.language || '-' }}</span>
            </div>

            <div class="info-item">
              <label>Timezone</label>
              <span>{{ contact.timezone || '-' }}</span>
            </div>

            <div class="info-item">
              <label>Active Status</label>
              <span>{{ contact.is_active ? 'Active' : 'Inactive' }}</span>
            </div>

            <div class="info-item">
              <label>Classic Menu</label>
              <span>{{ contact.use_classic_menu ? 'Enabled' : 'Disabled' }}</span>
            </div>

            <div class="info-item">
              <label>Enable Global Search</label>
              <span>{{ contact.enable_search ? 'Yes' : 'No' }}</span>
            </div>

            <div class="info-item">
              <label>Auto Hide Menu</label>
              <span>{{ contact.auto_hide_menu ? 'Yes' : 'No' }}</span>
            </div>

            <div class="info-item">
              <label>Enable GenAI Access</label>
              <span>{{ contact.enable_genai ? 'Yes' : 'No' }}</span>
            </div>

            <div class="info-item">
              <label>Contact Role</label>
              <div class="roles-container">
                <mat-chip class="role-chip" *ngIf="contact.is_org_admin">Organization Admin</mat-chip>
                <mat-chip class="role-chip" *ngIf="!contact.is_org_admin">Contact User</mat-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <form *ngIf="isEditMode && editForm" [formGroup]="editForm" class="edit-form">
          <div class="two-column-layout">
            <!-- Left Column: Basic Information -->
            <div class="left-column">
              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username" readonly>
                <mat-hint>Username cannot be changed</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="first_name">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="last_name">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phone_number">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Organization</mat-label>
                <input matInput formControlName="organization_name" readonly>
                <mat-hint>Organization cannot be changed</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Job Title</mat-label>
                <input matInput formControlName="job_title">
              </mat-form-field>
            </div>

            <!-- Right Column: Settings & Roles -->
            <div class="right-column">
              <mat-form-field appearance="outline">
                <mat-label>Language</mat-label>
                <mat-select formControlName="language">
                  <mat-option value="en">English</mat-option>
                  <mat-option value="es">Spanish</mat-option>
                  <mat-option value="fr">French</mat-option>
                  <mat-option value="de">German</mat-option>
                  <mat-option value="it">Italian</mat-option>
                  <mat-option value="pt">Portuguese</mat-option>
                  <mat-option value="ja">Japanese</mat-option>
                  <mat-option value="zh">Chinese</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Timezone</mat-label>
                <mat-select formControlName="timezone">
                  <mat-option [value]="''">None</mat-option>
                  <mat-option *ngFor="let tz of timezones" [value]="tz">{{ tz }}</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="toggle-field">
                <mat-slide-toggle formControlName="is_active" color="primary">
                  Active Status
                </mat-slide-toggle>
              </div>

              <div class="toggle-field">
                <mat-slide-toggle formControlName="use_classic_menu" color="primary">
                  Use Classic Menu
                </mat-slide-toggle>
              </div>

              <div class="toggle-field">
                <mat-slide-toggle formControlName="enable_search" color="primary">
                  Enable Global Search
                </mat-slide-toggle>
              </div>

              <div class="toggle-field">
                <mat-slide-toggle formControlName="auto_hide_menu" color="primary">
                  Auto Hide Menu
                </mat-slide-toggle>
              </div>

              <div class="toggle-field">
                <mat-slide-toggle formControlName="enable_genai" color="primary">
                  Enable GenAI Access
                </mat-slide-toggle>
              </div>

              <div class="roles-section">
                <h4>Contact Role</h4>
                <div class="toggle-field">
                  <mat-slide-toggle formControlName="is_org_admin" color="primary">
                    Organization Admin
                  </mat-slide-toggle>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button mat-button (click)="cancelEdit()" type="button">Cancel</button>
            <button mat-raised-button color="primary" (click)="saveChanges()" type="button">
              <mat-icon>save</mat-icon>
              Save Changes
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .contact-detail-container {
      padding: 24px;
    }

    .page-header {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-button {
      margin-right: 8px;
    }

    .header-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content button {
      margin-left: 16px;
    }

    .header-content button mat-icon {
      margin-right: 8px;
    }

    .header-content h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1976d2;
    }

    .header-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .loading-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      gap: 16px;
    }

    .loading-card p {
      color: #666;
      margin: 0;
    }

    .details-card {
      padding: 24px;
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .details-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .header-status {
      font-size: 11px;
      font-weight: 600;
      min-height: 28px;
      height: 28px;
    }

    .details-header button mat-icon {
      margin-right: 8px;
    }

    .two-column-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 24px;
    }

    .left-column, .right-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .left-column mat-form-field,
    .right-column mat-form-field {
      width: 100%;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item label {
      font-size: 11px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item span {
      font-size: 15px;
      color: #333;
    }

    .code-badge {
      display: inline-block;
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-family: monospace;
      font-size: 13px;
    }

    .status-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
      background-color: #f5f5f5;
      color: #666;
    }

    .status-chip.active-chip {
      background-color: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .roles-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .role-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
      background-color: #fff3e0;
      color: #e65100;
    }

    .error-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      gap: 16px;
      text-align: center;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .error-card p {
      color: #666;
      margin: 0 0 16px 0;
      font-size: 16px;
    }

    .edit-form {
      margin-top: 8px;
    }

    .toggle-field {
      padding: 12px 0;
    }

    .roles-section {
      margin-top: 16px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .roles-section h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #1976d2;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .form-actions button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class ContactDetailComponent implements OnInit {
  contact: User | null = null;
  loading = true;
  error: string | null = null;
  isEditMode = false;
  editForm: FormGroup | null = null;
  timezones: string[] = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Madrid',
    'Europe/Rome',
    'Europe/Amsterdam',
    'Europe/Brussels',
    'Europe/Vienna',
    'Europe/Warsaw',
    'Europe/Stockholm',
    'Europe/Helsinki',
    'Europe/Dublin',
    'Europe/Zurich',
    'Asia/Dubai',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Singapore',
    'Asia/Seoul',
    'Asia/Bangkok',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadContact(+id);
    }
  }

  loadContact(id: number): void {
    this.loading = true;
    this.error = null;
    this.usersService.getUser(id, 'contact').subscribe({
      next: (user) => {
        console.log('=== Contact Data ===', user);
        this.contact = user;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading contact:', err);
        this.error = err.error?.detail || 'Failed to load contact';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/contacts']);
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode && this.contact) {
      // Create form with current contact values
      this.editForm = this.fb.group({
        username: [{value: this.contact.username, disabled: true}],
        email: [this.contact.email || ''],
        first_name: [this.contact.first_name || ''],
        last_name: [this.contact.last_name || ''],
        phone_number: [this.contact.phone_number || ''],
        organization_name: [{value: this.contact.organization_name || '', disabled: true}],
        job_title: [this.contact.job_title || ''],
        language: [this.contact.language || 'en'],
        timezone: [this.contact.timezone || ''],
        is_active: [this.contact.is_active],
        use_classic_menu: [this.contact.use_classic_menu || false],
        enable_search: [this.contact.enable_search !== undefined ? this.contact.enable_search : true],
        auto_hide_menu: [this.contact.auto_hide_menu || false],
        enable_genai: [this.contact.enable_genai || false],
        is_org_admin: [this.contact.is_org_admin || false]
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editForm = null;
  }

  saveChanges(): void {
    if (!this.editForm || !this.contact) {
      return;
    }

    const updateData = this.editForm.value;

    this.usersService.updateUser(this.contact.id, updateData, 'contact').subscribe({
      next: (updatedUser) => {
        this.contact = updatedUser;
        this.isEditMode = false;
        this.editForm = null;

        // If editing own profile, update AuthService's currentUser to reflect changes immediately
        const currentUser = this.authService.currentUser;
        if (currentUser && currentUser.id === updatedUser.id) {
          this.authService.updateCurrentUser(updatedUser);
        }

        this.snackBar.open('Contact updated successfully', 'Close', {
          duration: 3000
        });
      },
      error: (err) => {
        console.error('Error updating contact:', err);
        this.snackBar.open(
          err.error?.detail || 'Failed to update contact',
          'Close',
          { duration: 5000 }
        );
      }
    });
  }

  changePassword(): void {
    if (!this.contact) {
      return;
    }

    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '500px',
      data: { user: this.contact }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Password changed successfully', 'Close', {
          duration: 3000
        });
      }
    });
  }

  deleteContact(): void {
    if (!this.contact) {
      return;
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete "${this.contact.username}"?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    this.usersService.deleteUser(this.contact.id, 'contact').subscribe({
      next: () => {
        this.snackBar.open('Contact deleted successfully', 'Close', {
          duration: 3000
        });
        this.router.navigate(['/contacts']);
      },
      error: (err) => {
        console.error('Error deleting contact:', err);
        this.snackBar.open(
          err.error?.detail || 'Failed to delete contact',
          'Close',
          { duration: 5000 }
        );
      }
    });
  }
}
