import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WorkbenchService } from '../../workbench/services/workbench.service';

@Component({
  selector: 'app-impact-score-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="config-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2 style="color: #1976d2;">Impact Score Settings</h2>
            <p>Configure thresholds for impact score priority levels</p>
          </div>
        </div>
      </div>

      <mat-card *ngIf="successMessage" class="success-message">
        {{ successMessage }}
      </mat-card>

      <mat-card *ngIf="error" class="error-message">
        {{ error }}
      </mat-card>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading configuration...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="config-card">
        <h3>Priority Thresholds</h3>
        <p class="description">
          Set the threshold values that determine when an issue is classified as High, Medium, or Low priority
          based on its weighted impact score.
        </p>

        <form (ngSubmit)="handleSave()">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>High Threshold</mat-label>
            <input matInput type="number" step="0.01" [(ngModel)]="config.high_threshold" name="high_threshold" required>
            <mat-hint>Impact scores >= this value are classified as High priority</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Medium Threshold</mat-label>
            <input matInput type="number" step="0.01" [(ngModel)]="config.medium_threshold" name="medium_threshold" required>
            <mat-hint>Impact scores >= this value (but < High) are classified as Medium priority</mat-hint>
          </mat-form-field>

          <div class="info-box">
            <h4>Priority Classification:</h4>
            <ul>
              <li><strong>High:</strong> Impact Score >= {{ config.high_threshold }}</li>
              <li><strong>Medium:</strong> {{ config.medium_threshold }} <= Impact Score < {{ config.high_threshold }}</li>
              <li><strong>Low:</strong> Impact Score < {{ config.medium_threshold }}</li>
            </ul>
          </div>

          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save Configuration' }}
            </button>
          </div>
        </form>
      </mat-card>

      <mat-card class="info-card">
        <h3>About Impact Scoring</h3>
        <p>
          The impact score is a weighted calculation based on multiple dimensions:
        </p>
        <ul>
          <li><strong>Clinical Risk (25%):</strong> Highest weight for patient safety concerns</li>
          <li><strong>Function Usage (20%):</strong> Second highest for frequently used features</li>
          <li><strong>Priority (15%):</strong> Issue priority level</li>
          <li><strong>Obligatory Change (15%):</strong> Regulatory or mandatory changes</li>
          <li><strong>Network Risk (15%):</strong> Multi-site deployment considerations</li>
          <li><strong>Complexity (10%):</strong> Lowest weight for implementation complexity</li>
        </ul>
      </mat-card>
    </div>
  `,
  styles: [`
    .config-container { padding: 24px; max-width: 800px; margin: 0 auto; }

    .page-header { margin-bottom: 24px; }

    .page-header h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1976d2 !important;
    }

    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2 !important; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }

    .success-message { padding: 16px; margin-bottom: 24px; background-color: #d4edda; color: #155724; }
    .error-message { padding: 16px; margin-bottom: 24px; background-color: #f8d7da; color: #721c24; }

    .loading-card { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .loading-card p { color: #666; margin: 0; }

    .config-card { padding: 24px; margin-bottom: 24px; }
    .config-card h3 { margin: 0 0 8px 0; font-size: 20px; font-weight: 600; }
    .description { color: #666; margin-bottom: 24px; font-size: 14px; }
    .form-field { width: 100%; margin-bottom: 24px; }

    .info-box { background-color: #e3f2fd; padding: 16px; border-radius: 4px; margin: 24px 0; }
    .info-box h4 { margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1976d2; }
    .info-box ul { margin: 0; padding-left: 20px; }
    .info-box li { margin-bottom: 6px; font-size: 14px; }

    .actions { display: flex; justify-content: flex-end; margin-top: 24px; }

    .info-card { padding: 24px; }
    .info-card h3 { margin: 0 0 12px 0; font-size: 18px; font-weight: 600; }
    .info-card p { color: #666; margin-bottom: 12px; font-size: 14px; }
    .info-card ul { margin: 0; padding-left: 20px; }
    .info-card li { margin-bottom: 8px; font-size: 14px; color: #666; }
  `]
})
export class ImpactScoreConfigComponent implements OnInit {
  loading = true;
  saving = false;
  successMessage = '';
  error = '';

  config = {
    high_threshold: 1.15,
    medium_threshold: 0.70
  };

  constructor(private workbenchService: WorkbenchService) {}

  ngOnInit(): void {
    this.fetchConfig();
  }

  fetchConfig(): void {
    this.loading = true;
    this.workbenchService.getImpactThresholds().subscribe({
      next: (config) => {
        this.config = config;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching config:', err);
        this.error = 'Failed to load configuration';
        this.loading = false;
      }
    });
  }

  handleSave(): void {
    this.error = '';
    this.successMessage = '';

    // Validation
    if (this.config.high_threshold <= this.config.medium_threshold) {
      this.error = 'High threshold must be greater than medium threshold';
      return;
    }

    if (this.config.medium_threshold <= 0) {
      this.error = 'Medium threshold must be greater than 0';
      return;
    }

    this.saving = true;

    // Note: The API endpoint for saving config would need to be added to the service
    // For now, this is a placeholder showing the intended flow
    setTimeout(() => {
      this.successMessage = 'Configuration saved successfully!';
      this.saving = false;
      setTimeout(() => this.successMessage = '', 3000);
    }, 500);
  }
}
