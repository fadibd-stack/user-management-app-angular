import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationsService } from '../services/organizations.service';
import { UsersService } from '../../users/services/users.service';
import { CountriesService } from '../../countries/services/countries.service';
import { Organization } from '../models/organization.model';
import { User } from '../../users/models/user.model';
import { Country } from '../../countries/models/country.model';
import { UserFormComponent } from '../../users/components/user-form.component';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="organization-detail-container">
      <!-- Header with back button -->
      <div class="page-header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <div>
            <h2>{{ organization?.name || 'Loading...' }}</h2>
            <p>Organization Details</p>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <mat-card *ngIf="loading && !error" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading organization details...</p>
      </mat-card>

      <!-- Error state -->
      <mat-card *ngIf="error" class="error-card">
        <mat-icon class="error-icon">error</mat-icon>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="goBack()">Go Back</button>
      </mat-card>

      <!-- Tabs -->
      <mat-tab-group *ngIf="!loading && organization" class="organization-tabs">
        <!-- Details Tab -->
        <mat-tab label="Details">
          <div class="tab-content">
            <mat-card class="details-card">
              <div class="details-header">
                <div class="header-left">
                  <h3>Organization Information</h3>
                  <mat-chip class="status-chip header-status" [class.active-chip]="organization.status === 'active'" [color]="organization.status === 'active' ? 'primary' : ''">
                    {{ organization.status?.toUpperCase() || 'INACTIVE' }}
                  </mat-chip>
                </div>
                <button mat-raised-button color="primary" (click)="toggleEditMode()">
                  <mat-icon>{{ isEditMode ? 'visibility' : 'edit' }}</mat-icon>
                  {{ isEditMode ? 'View Mode' : 'Edit Mode' }}
                </button>
              </div>

              <!-- View Mode -->
              <div *ngIf="!isEditMode" class="two-column-layout">
                <!-- Left Column: Organization Information -->
                <div class="left-column">
                  <div class="info-item">
                    <label>Name</label>
                    <span>{{ organization.name }}</span>
                  </div>

                  <div class="info-item">
                    <label>Sitecode</label>
                    <span>{{ organization.sitecode || '-' }}</span>
                  </div>

                  <div class="info-item">
                    <label>Country</label>
                    <span>{{ organization.country_name || '-' }}</span>
                  </div>

                  <div class="info-item">
                    <label>Edition</label>
                    <span>{{ organization.edition_name || '-' }}</span>
                  </div>

                  <div class="info-item">
                    <label>TrakCare Version</label>
                    <span>{{ organization.trakcare_version || '-' }}</span>
                  </div>

                  <div class="info-item">
                    <label>Latest Patch</label>
                    <span>{{ organization.latest_patch || '-' }}</span>
                  </div>

                  <div class="info-item">
                    <label>Latest Patch Applied Date</label>
                    <span>{{ organization.latest_patch_applied_date ? (organization.latest_patch_applied_date | date:'short') : '-' }}</span>
                  </div>
                </div>

                <!-- Right Column: Editable Fields (View-only display) -->
                <div class="right-column">
                  <div class="info-item">
                    <label>Domain</label>
                    <span>{{ organization.domain || '-' }}</span>
                  </div>

                  <div class="info-item">
                    <label>Deployment Mode</label>
                    <span>{{ organization.deployment_mode || '-' }}</span>
                  </div>

                  <div class="info-item">
                    <label>Timezone</label>
                    <span>{{ organization.timezone || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Edit Mode -->
              <form *ngIf="isEditMode && editForm" [formGroup]="editForm" class="edit-form">
                <div class="two-column-layout">
                  <!-- Left Column: Organization Information (read-only) -->
                  <div class="left-column">
                    <div class="info-item">
                      <label>Name</label>
                      <span>{{ organization.name }}</span>
                    </div>

                    <div class="info-item">
                      <label>Sitecode</label>
                      <span>{{ organization.sitecode || '-' }}</span>
                    </div>

                    <div class="info-item">
                      <label>Country</label>
                      <span>{{ organization.country_name || '-' }}</span>
                    </div>

                    <div class="info-item">
                      <label>Edition</label>
                      <span>{{ organization.edition_name || '-' }}</span>
                    </div>

                    <div class="info-item">
                      <label>TrakCare Version</label>
                      <span>{{ organization.trakcare_version || '-' }}</span>
                    </div>

                    <div class="info-item">
                      <label>Latest Patch</label>
                      <span>{{ organization.latest_patch || '-' }}</span>
                    </div>

                    <div class="info-item">
                      <label>Latest Patch Applied Date</label>
                      <span>{{ organization.latest_patch_applied_date ? (organization.latest_patch_applied_date | date:'short') : '-' }}</span>
                    </div>
                  </div>

                  <!-- Right Column: Editable Fields -->
                  <div class="right-column">
                    <mat-form-field appearance="outline">
                      <mat-label>Domain</mat-label>
                      <input matInput formControlName="domain">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Deployment Mode</mat-label>
                      <mat-select formControlName="deployment_mode">
                        <mat-option value="">None</mat-option>
                        <mat-option value="onPrem">On Premises</mat-option>
                        <mat-option value="Hosted">Hosted</mat-option>
                        <mat-option value="Cloud">Cloud</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Timezone</mat-label>
                      <mat-select formControlName="timezone">
                        <mat-option [value]="''">None</mat-option>
                        <mat-option *ngFor="let tz of timezones" [value]="tz">{{ tz }}</mat-option>
                      </mat-select>
                    </mat-form-field>
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
        </mat-tab>

        <!-- IS Info Tab -->
        <mat-tab label="IS Info">
          <div class="tab-content">
            <mat-card class="is-info-card">
              <!-- Three Column Layout -->
              <div class="is-info-top-section">
                <!-- Last Built Adhoc Column -->
                <div class="is-info-column">
                  <h4>Last Built Adhoc</h4>
                  <div class="is-info-content">
                    <!-- Placeholder content - will be populated from API -->
                    <p>Data will be loaded from API</p>
                  </div>
                </div>

                <!-- Licensed Product Summary Column -->
                <div class="is-info-column">
                  <h4>Licensed Product Summary</h4>
                  <div class="is-info-content">
                    <!-- Placeholder content - will be populated from API -->
                    <p>Data will be loaded from API</p>
                  </div>
                </div>

                <!-- Ordered Product Summary Column -->
                <div class="is-info-column">
                  <h4>Ordered Product Summary</h4>
                  <div class="is-info-content">
                    <!-- Placeholder content - will be populated from API -->
                    <p>Data will be loaded from API</p>
                  </div>
                </div>
              </div>

              <!-- License Detail Section (Full Width) -->
              <div class="is-info-bottom-section">
                <h4>License Detail</h4>
                <div class="is-info-content">
                  <!-- Placeholder content - will be populated from API -->
                  <p>Data will be loaded from API</p>
                </div>
              </div>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Contacts Tab -->
        <mat-tab label="Contacts">
          <div class="tab-content">
            <mat-card class="contacts-card">
              <div class="contacts-header">
                <h3>Organization Contacts</h3>
                <button mat-raised-button color="primary" (click)="addContact()">
                  <mat-icon>person_add</mat-icon>
                  Add Contact
                </button>
              </div>

              <!-- Loading contacts -->
              <div *ngIf="loadingContacts" class="loading-section">
                <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
                <p>Loading contacts...</p>
              </div>

              <!-- Contacts table -->
              <div *ngIf="!loadingContacts">
                <table mat-table [dataSource]="contacts" class="full-width-table" *ngIf="contacts.length > 0">
                  <ng-container matColumnDef="username">
                    <th mat-header-cell *matHeaderCellDef>USERNAME</th>
                    <td mat-cell *matCellDef="let contact">
                      <span class="code-badge">{{ contact.username }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>NAME</th>
                    <td mat-cell *matCellDef="let contact">
                      {{ contact.first_name }} {{ contact.last_name }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>EMAIL</th>
                    <td mat-cell *matCellDef="let contact">{{ contact.email }}</td>
                  </ng-container>

                  <ng-container matColumnDef="role">
                    <th mat-header-cell *matHeaderCellDef>ROLE</th>
                    <td mat-cell *matCellDef="let contact">
                      <span class="code-badge">{{ contact.is_org_admin ? 'Org Admin' : 'Contact' }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>STATUS</th>
                    <td mat-cell *matCellDef="let contact">
                      <mat-chip class="status-chip" [class.active-chip]="contact.is_active">
                        {{ contact.is_active ? 'ACTIVE' : 'INACTIVE' }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
                    <td mat-cell *matCellDef="let contact">
                      <button mat-icon-button (click)="editContact(contact)">
                        <mat-icon>edit</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="contactColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: contactColumns;"></tr>
                </table>

                <!-- No contacts -->
                <div *ngIf="contacts.length === 0" class="no-data">
                  <mat-icon class="no-data-icon">people</mat-icon>
                  <p>No contacts found for this organization</p>
                  <p class="no-data-hint">Click "Add Contact" to create the first contact</p>
                </div>
              </div>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .organization-detail-container {
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

    .organization-tabs {
      margin-top: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .details-card, .contacts-card {
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

    .contacts-card h3 {
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .detail-item label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-item span {
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

    .api-badge {
      display: inline-block;
      background-color: #fff3e0;
      color: #e65100;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-left: 8px;
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

    .left-column h4, .right-column h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1976d2;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .left-column mat-form-field {
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

    .readonly-field {
      opacity: 0.7;
    }

    .readonly-field input,
    .readonly-field .mat-mdc-select {
      cursor: not-allowed;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .contacts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .contacts-header h3 {
      margin: 0;
    }

    .contacts-header button mat-icon {
      margin-right: 8px;
    }

    .loading-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      gap: 16px;
    }

    .loading-section p {
      color: #666;
      margin: 0;
    }

    .full-width-table {
      width: 100%;
    }

    th.mat-header-cell {
      font-weight: 600;
      font-size: 12px;
      color: #666;
      letter-spacing: 0.5px;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px 24px;
      text-align: center;
    }

    .no-data-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-data p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 16px;
      font-weight: 500;
    }

    .no-data-hint {
      color: #999;
      font-size: 14px;
      max-width: 400px;
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

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
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

    /* IS Info Tab Styles */
    .is-info-card {
      padding: 24px;
    }

    .is-info-top-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }

    .is-info-column {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
    }

    .is-info-column h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1976d2;
      text-align: center;
      padding-bottom: 12px;
      border-bottom: 2px solid #1976d2;
    }

    .is-info-bottom-section {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
    }

    .is-info-bottom-section h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1976d2;
      padding-bottom: 12px;
      border-bottom: 2px solid #1976d2;
    }

    .is-info-content {
      color: #666;
    }

    .is-info-content p {
      margin: 8px 0;
      font-size: 14px;
    }
  `]
})
export class OrganizationDetailComponent implements OnInit {
  organization: Organization | null = null;
  contacts: User[] = [];
  countries: Country[] = [];
  loading = true;
  loadingContacts = true;
  error: string | null = null;
  contactColumns: string[] = ['username', 'name', 'email', 'role', 'status', 'actions'];
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
    private organizationsService: OrganizationsService,
    private usersService: UsersService,
    private countriesService: CountriesService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrganization(+id);
      this.loadContacts(+id);
    }
    this.loadCountries();
  }

  loadCountries(): void {
    this.countriesService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (err) => {
        console.error('Error loading countries:', err);
      }
    });
  }

  loadOrganization(id: number): void {
    this.loading = true;
    this.error = null;
    this.organizationsService.getOrganization(id).subscribe({
      next: (org) => {
        console.log('=== Organization Data ===', org);
        console.log('Sitecode:', org.sitecode);
        console.log('Edition Name:', org.edition_name);
        console.log('Latest Patch Applied Date:', org.latest_patch_applied_date);
        this.organization = org;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading organization:', err);
        this.error = err.error?.detail || 'Failed to load organization';
        this.loading = false;
      }
    });
  }

  loadContacts(organizationId: number): void {
    this.loadingContacts = true;
    this.usersService.getUsers().subscribe({
      next: (users) => {
        // Filter contacts for this organization
        this.contacts = users.filter(
          u => u.user_type === 'contact' && u.organization_id === organizationId
        );
        this.loadingContacts = false;
      },
      error: (err) => {
        console.error('Error loading contacts:', err);
        this.loadingContacts = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/organizations']);
  }

  addContact(): void {
    // Open user form dialog in create mode for contact
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: {
        _createMode: true,
        _userType: 'contact',
        organization_id: this.organization?.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.organization) {
        this.loadContacts(this.organization.id);
      }
    });
  }

  editContact(contact: User): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: contact
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.organization) {
        this.loadContacts(this.organization.id);
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode && this.organization) {
      // Create form with current organization values
      this.editForm = this.fb.group({
        name: [{value: this.organization.name, disabled: true}],
        country_id: [{value: this.organization.country_id || null, disabled: true}],
        domain: [this.organization.domain || ''],
        deployment_mode: [this.organization.deployment_mode || ''],
        trakcare_version: [{value: this.organization.trakcare_version || '', disabled: true}],
        status: [{value: this.organization.status || 'active', disabled: true}],
        timezone: [this.organization.timezone || '']
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editForm = null;
  }

  saveChanges(): void {
    if (!this.editForm || !this.organization) {
      return;
    }

    const updateData = this.editForm.value;

    this.organizationsService.updateOrganization(this.organization.id, updateData).subscribe({
      next: (updatedOrg) => {
        this.organization = updatedOrg;
        this.isEditMode = false;
        this.editForm = null;
        this.snackBar.open('Organization updated successfully', 'Close', {
          duration: 3000
        });
      },
      error: (err) => {
        console.error('Error updating organization:', err);
        this.snackBar.open(
          err.error?.detail || 'Failed to update organization',
          'Close',
          { duration: 5000 }
        );
      }
    });
  }
}
