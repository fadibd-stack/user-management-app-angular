import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReleaseHighlightsService } from '../services/release-highlights.service';
import { ReleasesService } from '../../releases/services/releases.service';
import { EditionsService } from '../../editions/services/editions.service';
import { Release } from '../../releases/models/release.model';
import { Edition } from '../../editions/models/edition.model';

@Component({
  selector: 'app-release-highlights',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ],
  template: `
    <div class="highlights-container">
      <div class="page-header">
        <h2>Get Release Highlights</h2>
        <p>Generate release highlights from TrakIntel API</p>
      </div>

      <mat-card *ngIf="error" class="error-card">
        {{ error }}
      </mat-card>

      <mat-expansion-panel [(expanded)]="panelExpanded" class="form-panel">
        <mat-expansion-panel-header>
          <mat-panel-title>Select Parameters</mat-panel-title>
        </mat-expansion-panel-header>

        <form (ngSubmit)="handleGenerate()" class="form-content">
          <div class="form-row">
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
              <mat-label>Generator Type *</mat-label>
              <mat-select [(ngModel)]="formData.generator" name="generator" required>
                <mat-option value="ReleaseHighlights">Release Highlights</mat-option>
                <mat-option value="DetailedReleaseNote">Detailed Release Note</mat-option>
                <mat-option value="DetailedReleaseNoteV2">Detailed Release Note V2</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Language *</mat-label>
              <mat-select [(ngModel)]="formData.lang" name="lang" required>
                <mat-option value="English">English</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Output Format *</mat-label>
              <mat-select [(ngModel)]="formData.format" name="format" required>
                <mat-option value="html">HTML</mat-option>
                <mat-option value="json">JSON</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field-full">
              <mat-label>Fixed Edition (Optional)</mat-label>
              <input matInput [(ngModel)]="formData.fixededition" name="fixededition" placeholder="e.g., England, Scotland">
              <mat-hint>Optional: Specify a fixed edition filter</mat-hint>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field-full">
              <mat-label>JQL Filter (Optional)</mat-label>
              <input matInput [(ngModel)]="formData.jql" name="jql" placeholder="e.g., status = 'Done'">
              <mat-hint>Optional: JIRA Query Language filter. Leave empty for cached templates.</mat-hint>
            </mat-form-field>
          </div>

          <button mat-raised-button color="primary" type="submit" [disabled]="generating">
            {{ generating ? 'Generating...' : 'Generate Highlights' }}
          </button>
        </form>
      </mat-expansion-panel>

      <mat-card *ngIf="highlights" class="results-card">
        <div class="results-header">
          <h3>Release Highlights</h3>
          <button *ngIf="formData.format === 'json'" mat-raised-button color="accent" (click)="copyToClipboard()">
            Copy JSON
          </button>
        </div>

        <div *ngIf="formData.format === 'html'" class="html-content" [innerHTML]="highlights"></div>
        <div *ngIf="formData.format === 'json'" class="json-content">{{ highlights | json }}</div>
      </mat-card>
    </div>
  `,
  styles: [`
    .highlights-container { padding: 24px; }
    .page-header h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; }
    .page-header p { margin: 0 0 24px 0; color: #666; }
    .error-card { padding: 16px; margin-bottom: 24px; background-color: #f8d7da; color: #721c24; }
    .form-panel { margin-bottom: 24px; }
    .form-content { padding: 16px 0; }
    .form-row { display: flex; gap: 16px; margin-bottom: 16px; }
    .form-field { flex: 1; }
    .form-field-full { width: 100%; }
    .results-card { padding: 24px; }
    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .results-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
    .html-content { background-color: white; padding: 32px; border-radius: 8px; border: 1px solid #e0e0e0; max-height: 700px; overflow-y: auto; }
    .json-content { background-color: #f5f5f5; padding: 16px; border-radius: 4px; max-height: 600px; overflow-y: auto; font-family: monospace; font-size: 13px; white-space: pre-wrap; }
  `]
})
export class ReleaseHighlightsComponent implements OnInit {
  releases: Release[] = [];
  editions: Edition[] = [];
  loading = true;
  generating = false;
  highlights: any = null;
  error = '';
  panelExpanded = true;

  formData = {
    release: '',
    edition: '',
    generator: 'ReleaseHighlights',
    lang: 'English',
    fixededition: '',
    jql: '',
    format: 'html'
  };

  constructor(
    private highlightsService: ReleaseHighlightsService,
    private releasesService: ReleasesService,
    private editionsService: EditionsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.releasesService.getReleases().subscribe({
      next: (releases) => {
        this.releases = releases;
        if (releases.length > 0) {
          this.formData.release = releases[0].code || '';
        }
      },
      error: (err) => {
        console.error('Error loading releases:', err);
        this.error = 'Failed to load releases. Please sync them first from System Configuration.';
      }
    });

    this.editionsService.getEditions().subscribe({
      next: (editions) => {
        this.editions = editions;
        if (editions.length > 0) {
          this.formData.edition = editions[0].code || '';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading editions:', err);
        this.error = 'Failed to load editions. Please sync them first from System Configuration.';
        this.loading = false;
      }
    });
  }

  handleGenerate(): void {
    if (!this.formData.release || !this.formData.edition) {
      this.error = 'Please select both release and edition';
      return;
    }

    this.generating = true;
    this.error = '';
    this.highlights = null;

    this.highlightsService.generateHighlights(this.formData).subscribe({
      next: (result) => {
        // If format is HTML and result has a 'data' property with the HTML blob, extract it
        if (this.formData.format === 'html' && result && typeof result === 'object' && 'data' in result) {
          this.highlights = result.data;
        } else {
          this.highlights = result;
        }
        this.panelExpanded = false;
        this.generating = false;
      },
      error: (err) => {
        console.error('Error generating highlights:', err);
        this.error = err.error?.detail || 'Failed to generate highlights. Please check your TrakIntel configuration.';
        this.generating = false;
      }
    });
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(JSON.stringify(this.highlights, null, 2));
    alert('Copied to clipboard!');
  }
}
