import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { WorkbenchService } from '../services/workbench.service';
import { ReleasesService } from '../../releases/services/releases.service';
import { EditionsService } from '../../editions/services/editions.service';
import { AuthService } from '../../../core/services/auth.service';
import { WorkbenchIssue } from '../models/workbench.model';
import { Release } from '../../releases/models/release.model';
import { Edition } from '../../editions/models/edition.model';

@Component({
  selector: 'app-workbench',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatTableModule
  ],
  template: `
    <div class="workbench-container">
      <div class="page-header">
        <h2>Workbench</h2>
        <p>Manage release documentation with AI-generated content</p>
      </div>

      <mat-card *ngIf="error" class="error-card">{{ error }}</mat-card>

      <mat-expansion-panel [(expanded)]="panelExpanded" class="form-panel">
        <mat-expansion-panel-header>
          <mat-panel-title>Filter Parameters</mat-panel-title>
        </mat-expansion-panel-header>

        <form (ngSubmit)="fetchWorkbench()" class="form-content">
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Username *</mat-label>
              <input matInput [(ngModel)]="formData.username" name="username" required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Release *</mat-label>
              <mat-select [(ngModel)]="formData.release" name="release" required>
                <mat-option value="">Select Release</mat-option>
                <mat-option *ngFor="let release of releases" [value]="release.code">
                  {{ release.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Edition *</mat-label>
              <mat-select [(ngModel)]="formData.edition" name="edition" required>
                <mat-option value="">Select Edition</mat-option>
                <mat-option *ngFor="let edition of editions" [value]="edition.code">
                  {{ edition.name }} ({{ edition.code }})
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Site (Optional)</mat-label>
              <input matInput [(ngModel)]="formData.site" name="site" placeholder="e.g., ENNT">
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Adhoc Key (Optional)</mat-label>
              <input matInput [(ngModel)]="formData.adhockey" name="adhockey">
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Language *</mat-label>
              <mat-select [(ngModel)]="formData.lang" name="lang" required>
                <mat-option value="English">English</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <button mat-raised-button color="primary" type="submit" [disabled]="fetching">
            {{ fetching ? 'Loading...' : 'Fetch Workbench Data' }}
          </button>
        </form>
      </mat-expansion-panel>

      <div *ngIf="issues.length > 0" class="issues-header">
        <h3>Issues ({{ issues.length }})</h3>
      </div>

      <mat-card *ngFor="let issue of issues" class="issue-card">
        <div class="issue-header" (click)="toggleIssue(issue.id)">
          <span class="expand-icon">{{ expandedIssues[issue.id] ? '▼' : '▶' }}</span>
          <mat-chip [class]="'type-' + issue.type.toLowerCase()">{{ issue.type }}</mat-chip>
          <span class="issue-key">{{ issue.key }}</span>
          <mat-chip [class]="'priority-' + getImpactPriority(issue).toLowerCase()">
            {{ getImpactPriority(issue) }}
          </mat-chip>
          <span class="issue-summary">{{ issue.summary }}</span>
          <span *ngIf="issue.locked" class="lock-icon">🔒</span>
        </div>

        <div *ngIf="expandedIssues[issue.id]" class="issue-content">
          <div class="content-layout">
            <div class="left-panel">
              <h4>Further Information</h4>
              <div *ngIf="issue.AIData" class="ai-content" [innerHTML]="sanitizeHtml(issue.AIData)"></div>
            </div>

            <div class="right-panel">
              <h4>Impact Score Breakdown</h4>

              <div class="total-score">
                <span>Total score (Adjusted): {{ calculateTotalScore(issue).toFixed(2) }}</span>
                <mat-chip [class]="'priority-' + getImpactPriority(issue).toLowerCase()">
                  {{ getImpactPriority(issue) }}
                </mat-chip>
              </div>

              <div class="score-items">
                <div class="score-item">
                  <span>Clinical Risk</span>
                  <div class="score-circle">{{ issue.impactscoreclinicalrisk || 0 }}</div>
                </div>
                <div class="score-item">
                  <span>Obligatory Change</span>
                  <div class="score-circle">{{ issue.impactscoreobligatorychange || 0 }}</div>
                </div>
                <div class="score-item">
                  <span>Function Usage</span>
                  <div class="score-circle">{{ issue.impactscorefunctionusage || 0 }}</div>
                </div>
                <div class="score-item">
                  <span>Complexity</span>
                  <div class="score-circle">{{ issue.impactscorecomplexity || 0 }}</div>
                </div>
                <div class="score-item">
                  <span>Network Risk</span>
                  <div class="score-circle">{{ issue.impactscorenetworkRisk || 0 }}</div>
                </div>
                <div class="score-item">
                  <span>Issue Priority</span>
                  <div class="score-circle">{{ issue.impactscorepriority || 0 }}</div>
                </div>
              </div>

              <div *ngIf="issue.LinkedIssues && issue.LinkedIssues.length > 0" class="linked-issues">
                <h5>External Links</h5>
                <div *ngFor="let linked of issue.LinkedIssues" class="linked-item">
                  <a [href]="linked.url" target="_blank">{{ linked.summary }}</a>
                  <div class="linked-ref">{{ linked.reference }}</div>
                </div>
              </div>

              <div *ngIf="issue.ProductMappings && issue.ProductMappings.length > 0" class="product-mappings">
                <h5>Product Mappings</h5>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Area</th>
                      <th>Function</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let mapping of issue.ProductMappings">
                      <td>{{ mapping.Product }}</td>
                      <td>{{ mapping.Area }}</td>
                      <td>{{ mapping.Function }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .workbench-container { padding: 24px; }
    .page-header h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; }
    .page-header p { margin: 0 0 24px 0; color: #666; }
    .error-card { padding: 16px; margin-bottom: 24px; background-color: #f8d7da; color: #721c24; }
    .form-panel { margin-bottom: 24px; }
    .form-content { padding: 16px 0; }
    .form-row { display: flex; gap: 16px; margin-bottom: 16px; }
    .form-field { flex: 1; }
    .issues-header { margin: 24px 0 16px 0; }
    .issues-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
    .issue-card { margin-bottom: 2px; padding: 8px 16px; }
    .issue-header { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
    .expand-icon { font-size: 14px; color: #1976d2; width: 12px; }
    .type-feature { background-color: #1976d2; color: white; }
    .type-bug { background-color: #d32f2f; color: white; }
    .type-enhancement { background-color: #7b1fa2; color: white; }
    .type-task { background-color: #00897b; color: white; }
    .issue-key { font-weight: 600; color: #1a237e; font-size: 13px; width: 95px; }
    .priority-high { background-color: #f57c00; color: white; }
    .priority-medium { background-color: #fbc02d; color: #000; }
    .priority-low { background-color: #388e3c; color: white; }
    .issue-summary { flex: 1; font-size: 13px; color: #424242; }
    .lock-icon { font-size: 14px; }
    .issue-content { padding: 16px 0; }
    .content-layout { display: flex; gap: 24px; }
    .left-panel { flex: 1; }
    .right-panel { width: 420px; }
    h4 { font-size: 14px; font-weight: 600; color: #757575; text-transform: uppercase; margin-bottom: 16px; }
    h5 { font-size: 14px; font-weight: 600; color: #757575; text-transform: uppercase; margin: 24px 0 12px 0; }
    .ai-content { background-color: #fafafa; padding: 20px; border-radius: 4px; border: 1px solid #e0e0e0; }
    .total-score { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; margin-bottom: 20px; border-bottom: 1px solid #e0e0e0; }
    .total-score span { font-size: 14px; font-weight: 600; }
    .score-items { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .score-item { display: flex; justify-content: space-between; align-items: center; }
    .score-item span { font-size: 14px; color: #424242; }
    .score-circle { width: 32px; height: 32px; border-radius: 50%; background-color: #1976d2; color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }
    .linked-item { margin-bottom: 8px; }
    .linked-item a { color: #1976d2; text-decoration: none; font-size: 14px; }
    .linked-ref { font-size: 12px; color: #757575; margin-top: 2px; }
    .product-mappings table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .product-mappings th { padding: 8px 0; text-align: left; font-weight: 600; color: #424242; border-bottom: 2px solid #e0e0e0; }
    .product-mappings td { padding: 8px 0; color: #424242; border-bottom: 1px solid #f0f0f0; }
  `]
})
export class WorkbenchComponent implements OnInit {
  releases: Release[] = [];
  editions: Edition[] = [];
  issues: WorkbenchIssue[] = [];
  expandedIssues: { [key: string]: boolean } = {};
  fetching = false;
  error = '';
  panelExpanded = true;
  impactThresholds = { high_threshold: 1.15, medium_threshold: 0.70 };

  formData = {
    username: '',
    release: '',
    edition: '',
    site: '',
    adhockey: '',
    lang: 'English'
  };

  constructor(
    private workbenchService: WorkbenchService,
    private releasesService: ReleasesService,
    private editionsService: EditionsService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.formData.username = user.username;
    }
    this.loadData();
  }

  loadData(): void {
    this.releasesService.getReleases().subscribe({
      next: (releases) => {
        this.releases = releases;
        if (releases.length > 0) {
          this.formData.release = releases[0].code || '';
        }
      },
      error: (err) => console.error(err)
    });

    this.editionsService.getEditions().subscribe({
      next: (editions) => {
        this.editions = editions;
        if (editions.length > 0) {
          this.formData.edition = editions[0].code || '';
        }
      },
      error: (err) => console.error(err)
    });

    this.workbenchService.getImpactThresholds().subscribe({
      next: (thresholds) => this.impactThresholds = thresholds,
      error: (err) => console.error(err)
    });
  }

  fetchWorkbench(): void {
    if (!this.formData.username || !this.formData.release || !this.formData.edition) {
      this.error = 'Please fill in username, release, and edition';
      return;
    }

    this.fetching = true;
    this.error = '';
    this.issues = [];

    this.workbenchService.fetchWorkbench(this.formData).subscribe({
      next: (response) => {
        this.issues = response.data || [];
        this.panelExpanded = false;
        this.fetching = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.detail || 'Failed to fetch workbench data. Please check your TrakIntel configuration.';
        this.fetching = false;
      }
    });
  }

  toggleIssue(issueId: string): void {
    this.expandedIssues[issueId] = !this.expandedIssues[issueId];
  }

  calculateTotalScore(issue: WorkbenchIssue): number {
    const weights = {
      clinicalRisk: 0.25,
      obligatoryChange: 0.15,
      complexity: 0.10,
      networkRisk: 0.15,
      priority: 0.15,
      functionUsage: 0.20
    };

    return (
      (parseFloat(issue.impactscorepriority) || 0) * weights.priority +
      (parseFloat(issue.impactscoreclinicalrisk) || 0) * weights.clinicalRisk +
      (parseFloat(issue.impactscoreobligatorychange) || 0) * weights.obligatoryChange +
      (parseFloat(issue.impactscorefunctionusage) || 0) * weights.functionUsage +
      (parseFloat(issue.impactscorecomplexity) || 0) * weights.complexity +
      (parseFloat(issue.impactscorenetworkRisk) || 0) * weights.networkRisk
    );
  }

  getImpactPriority(issue: WorkbenchIssue): string {
    const totalScore = this.calculateTotalScore(issue);
    if (totalScore >= this.impactThresholds.high_threshold) return 'High';
    if (totalScore >= this.impactThresholds.medium_threshold) return 'Medium';
    return 'Low';
  }

  sanitizeHtml(html: string): SafeHtml {
    if (!html) {
      return '';
    }
    // Sanitize HTML to prevent XSS attacks
    return this.sanitizer.sanitize(1, html) || '';
  }
}
