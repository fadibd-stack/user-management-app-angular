import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrganizationsService } from '../services/organizations.service';
import { EditionsService } from '../../editions/services/editions.service';
import { CountriesService } from '../../countries/services/countries.service';
import { Organization, OrganizationCreate, OrganizationUpdate } from '../models/organization.model';
import { Edition } from '../../editions/models/edition.model';
import { Country } from '../../countries/models/country.model';

@Component({
  selector: 'app-organization-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Organization' : 'Create Organization' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="org-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Organization Name *</mat-label>
          <input matInput formControlName="name" />
          <mat-error *ngIf="form.get('name')?.hasError('required')">Organization name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Domain *</mat-label>
          <input matInput formControlName="domain" placeholder="e.g., 'example.com', 'hospital.org'" />
          <mat-hint>Organization domain name (e.g., 'example.com', 'hospital.org')</mat-hint>
          <mat-error *ngIf="form.get('domain')?.hasError('required')">Domain is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Site Code</mat-label>
          <input matInput formControlName="sitecode" />
          <mat-hint>Unique organization code</mat-hint>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Edition</mat-label>
            <mat-select formControlName="edition_id">
              <mat-option [value]="null">-- Select Edition --</mat-option>
              <mat-option *ngFor="let edition of editions" [value]="edition.id">
                {{ edition.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Deployment Mode</mat-label>
            <mat-select formControlName="deployment_mode">
              <mat-option value="onPrem">On Premises</mat-option>
              <mat-option value="Hosted">Hosted</mat-option>
              <mat-option value="Cloud">Cloud</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Country</mat-label>
          <mat-select formControlName="country_id">
            <mat-option [value]="null">-- Select Country --</mat-option>
            <mat-option *ngFor="let country of countries" [value]="country.id">
              {{ country.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Timezone *</mat-label>
          <mat-select formControlName="timezone">
            <mat-option value="UTC">UTC</mat-option>
            <mat-option value="America/New_York">America/New_York</mat-option>
            <mat-option value="America/Chicago">America/Chicago</mat-option>
            <mat-option value="America/Denver">America/Denver</mat-option>
            <mat-option value="America/Los_Angeles">America/Los_Angeles</mat-option>
            <mat-option value="Europe/London">Europe/London</mat-option>
            <mat-option value="Europe/Paris">Europe/Paris</mat-option>
            <mat-option value="Europe/Berlin">Europe/Berlin</mat-option>
            <mat-option value="Asia/Dubai">Dubai, Abu Dhabi</mat-option>
            <mat-option value="Asia/Riyadh">Riyadh</mat-option>
            <mat-option value="Asia/Kuwait">Kuwait</mat-option>
            <mat-option value="Asia/Qatar">Qatar</mat-option>
            <mat-option value="Asia/Muscat">Muscat</mat-option>
            <mat-option value="Asia/Tokyo">Asia/Tokyo</mat-option>
            <mat-option value="Asia/Shanghai">Asia/Shanghai</mat-option>
            <mat-option value="Australia/Sydney">Australia/Sydney</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('timezone')?.hasError('required')">Timezone is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Local Name</mat-label>
          <input matInput formControlName="local_name" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Workday Name</mat-label>
          <input matInput formControlName="workday_name" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status *</mat-label>
          <mat-select formControlName="status">
            <mat-option value="active">Active</mat-option>
            <mat-option value="inactive">Inactive</mat-option>
            <mat-option value="trial">Trial</mat-option>
            <mat-option value="suspended">Suspended</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('status')?.hasError('required')">Status is required</mat-error>
        </mat-form-field>

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
    .form-row { display: flex; gap: 16px; }
    .half-width { width: calc(50% - 8px); margin-bottom: 16px; }
    mat-dialog-content { min-height: 400px; max-height: 70vh; overflow-y: auto; padding: 24px; }
    .error-message { color: #d32f2f; margin-top: 16px; }
    mat-spinner { display: inline-block; margin-right: 8px; }
  `]
})
export class OrganizationFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  editions: Edition[] = [];
  countries: Country[] = [];

  constructor(
    private fb: FormBuilder,
    private organizationsService: OrganizationsService,
    private editionsService: EditionsService,
    private countriesService: CountriesService,
    private dialogRef: MatDialogRef<OrganizationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Organization | null
  ) {
    this.isEditMode = !!data;
    this.form = this.fb.group({
      name: ['', Validators.required],
      domain: ['', Validators.required],
      sitecode: [''],
      edition_id: [null],
      deployment_mode: ['onPrem'],
      country_id: [null],
      timezone: ['UTC', Validators.required],
      local_name: [''],
      workday_name: [''],
      status: ['active', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load editions and countries
    this.editionsService.getEditions().subscribe({
      next: (editions) => this.editions = editions,
      error: (err) => console.error('Error loading editions:', err)
    });

    this.countriesService.getCountries().subscribe({
      next: (countries) => this.countries = countries,
      error: (err) => console.error('Error loading countries:', err)
    });

    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        domain: this.data.domain || '',
        sitecode: this.data.sitecode || '',
        edition_id: this.data.edition_id || null,
        deployment_mode: this.data.deployment_mode || 'onPrem',
        country_id: this.data.country_id || null,
        timezone: this.data.timezone || 'UTC',
        local_name: this.data.local_name || '',
        workday_name: this.data.workday_name || '',
        status: this.data.status || 'active'
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const payload = this.form.value;

    const request = this.isEditMode && this.data
      ? this.organizationsService.updateOrganization(this.data.id, payload)
      : this.organizationsService.createOrganization(payload);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        console.error('Error saving organization:', err);
        this.error = err.error?.error?.message || 'Failed to save organization.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
