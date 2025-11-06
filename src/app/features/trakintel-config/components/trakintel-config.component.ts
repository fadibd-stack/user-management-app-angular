import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-trakintel-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatExpansionModule, MatIconModule, MatChipsModule, MatDialogModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <div class="config-container">
      <h2>TrakIntel Configuration</h2>
      <mat-card *ngIf="message" [class]="'message-' + messageType">{{ message }}</mat-card>
      <mat-card class="config-form">
        <form (ngSubmit)="handleSave()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>TrakIntel URL *</mat-label>
            <input matInput [(ngModel)]="trakintelUrl" name="trakintelUrl" required
                   placeholder="http://ehrhub.iscinternal.com/csp/dev/rest">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>API Token *</mat-label>
            <input matInput type="password" [(ngModel)]="trakintelToken" name="trakintelToken" required>
          </mat-form-field>
          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save Configuration' }}
            </button>
          </div>
        </form>
      </mat-card>

      <mat-card class="api-reference">
        <h3>API Endpoints Reference & Testing</h3>
        <div class="info-banner">
          <mat-icon>info</mat-icon>
          <div>
            <strong>Test Individual Endpoints:</strong> Use the play button (▶) next to each endpoint to test it directly.
            Make sure to save your configuration first and ensure the <code>/api/trakintel/test-endpoint</code> backend proxy is implemented.
          </div>
        </div>
        <mat-accordion>
          <mat-expansion-panel *ngFor="let category of apiCategories">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>{{ category.icon }}</mat-icon>
                {{ category.name }}
              </mat-panel-title>
            </mat-expansion-panel-header>
            <div class="endpoints-list">
              <div *ngFor="let endpoint of category.endpoints" class="endpoint-item">
                <div class="endpoint-header">
                  <mat-chip-set>
                    <mat-chip [class]="'method-' + endpoint.method.toLowerCase()">{{ endpoint.method }}</mat-chip>
                  </mat-chip-set>
                  <code class="endpoint-path">{{ endpoint.path }}</code>
                  <button mat-icon-button (click)="testEndpoint(endpoint)"
                          [disabled]="!trakintelUrl || !trakintelToken"
                          matTooltip="Test this endpoint">
                    <mat-icon>play_arrow</mat-icon>
                  </button>
                </div>
                <p class="endpoint-description">{{ endpoint.description }}</p>
                <div *ngIf="endpoint.note" class="endpoint-note">
                  <mat-icon>info</mat-icon>
                  <span>{{ endpoint.note }}</span>
                </div>

                <div *ngIf="testingEndpoint === endpoint.path" class="test-section">
                  <mat-form-field *ngIf="endpoint.method === 'POST' || endpoint.method === 'PUT'" appearance="outline" class="full-width">
                    <mat-label>Request Body (JSON)</mat-label>
                    <textarea matInput [(ngModel)]="requestBody" rows="4"
                              [placeholder]="getRequestBodyPlaceholder(endpoint)"></textarea>
                  </mat-form-field>
                  <div class="test-actions">
                    <button mat-raised-button color="primary" (click)="executeTest(endpoint)" [disabled]="executingTest">
                      {{ executingTest ? 'Testing...' : 'Execute' }}
                    </button>
                    <button mat-button (click)="cancelTest()">Cancel</button>
                  </div>
                </div>

                <div *ngIf="testResults[endpoint.path]" class="test-results">
                  <div class="results-header">
                    <strong>Response:</strong>
                    <button mat-icon-button (click)="clearTestResult(endpoint.path)" matTooltip="Clear result">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  <pre class="results-body">{{ testResults[endpoint.path] }}</pre>
                </div>
              </div>
            </div>
          </mat-expansion-panel>
        </mat-accordion>
      </mat-card>
    </div>
  `,
  styles: [`
    .config-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    h2 { font-size: 28px; font-weight: 600; margin-bottom: 24px; }
    h3 { font-size: 20px; font-weight: 600; margin-bottom: 16px; }
    .message-success { background-color: #d4edda; color: #155724; padding: 16px; margin-bottom: 24px; }
    .message-error { background-color: #f8d7da; color: #721c24; padding: 16px; margin-bottom: 24px; }
    .message-info { background-color: #d1ecf1; color: #0c5460; padding: 16px; margin-bottom: 24px; }
    .config-form { padding: 24px; margin-bottom: 24px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .actions { display: flex; gap: 16px; justify-content: flex-end; margin-top: 24px; }
    .api-reference { padding: 24px; }
    .endpoints-list { padding: 16px 0; }
    .endpoint-item { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e0e0e0; }
    .endpoint-item:last-child { border-bottom: none; }
    .endpoint-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .endpoint-path { font-family: 'Courier New', monospace; font-size: 14px; color: #1976d2; }
    .endpoint-description { margin: 8px 0; color: #666; font-size: 14px; }
    .endpoint-note { display: flex; align-items: center; gap: 8px; padding: 8px; background: #fff3cd; border-radius: 4px; font-size: 13px; color: #856404; }
    .endpoint-note mat-icon { font-size: 18px; width: 18px; height: 18px; }
    mat-panel-title { display: flex; align-items: center; gap: 8px; }
    mat-panel-title mat-icon { color: #1976d2; }
    .method-get { background-color: #4caf50 !important; color: white !important; }
    .method-post { background-color: #2196f3 !important; color: white !important; }
    .method-put { background-color: #ff9800 !important; color: white !important; }
    .method-delete { background-color: #f44336 !important; color: white !important; }
    mat-chip { font-weight: 600; min-width: 60px; text-align: center; }
    .test-section { margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 4px; }
    .test-actions { display: flex; gap: 8px; margin-top: 8px; }
    .test-results { margin-top: 16px; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
    .results-header { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f5f5f5; border-bottom: 1px solid #e0e0e0; }
    .results-body { margin: 0; padding: 16px; background: #fff; font-family: 'Courier New', monospace; font-size: 12px; overflow-x: auto; max-height: 400px; overflow-y: auto; }
    .info-banner { display: flex; gap: 12px; padding: 16px; background: #e3f2fd; border-radius: 4px; margin-bottom: 16px; align-items: flex-start; }
    .info-banner mat-icon { color: #1976d2; margin-top: 2px; }
    .info-banner code { background: #fff; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
  `]

})
export class TrakintelConfigComponent implements OnInit {
  trakintelUrl = 'http://ehrhub.iscinternal.com/csp/dev/rest';
  trakintelToken = '';
  saving = false;
  message = '';
  messageType = 'info';
  testingEndpoint: string | null = null;
  executingTest = false;
  requestBody = '';
  testResults: { [key: string]: string } = {};

  apiCategories = [
    {
      name: 'Code Tables & Forms',
      icon: 'table_chart',
      endpoints: [
        { method: 'GET', path: '/forms/organisations', description: 'Get list of all organizations' },
        { method: 'GET', path: '/forms/organisations/1', description: 'Get organization with rowid 1' },
        { method: 'GET', path: '/forms/organisations/schema', description: 'Get schema for organizations (required fields, etc.)' },
        { method: 'PUT', path: '/forms/organisations/1', description: 'Update organization with rowid 1', note: 'Body: {code, description, localname, editioncode, sitecode, countrycode, trakcareversion, address, dataplatformversion, latestpatch, latestpatchcaptureddate, latestpatchapplieddate, editionlink, isActive}' },
        { method: 'POST', path: '/forms/organisations', description: 'Create new organization', note: 'Body: {code, description, localname, editioncode, sitecode, countrycode, trakcareversion, address, dataplatformversion, latestpatch, latestpatchcaptureddate, latestpatchapplieddate, editionlink, isActive}' },
        { method: 'DELETE', path: '/forms/organisations/17', description: 'Delete organization with rowid 17' }
      ]
    },
    {
      name: 'Lookups',
      icon: 'search',
      endpoints: [
        { method: 'GET', path: '/lookups/editions', description: 'Get editions lookup data' },
        { method: 'GET', path: '/lookups/organisations', description: 'Get organizations lookup data' },
        { method: 'GET', path: '/lookups/users', description: 'Get users lookup data' },
        { method: 'POST', path: '/lookups/builds', description: 'Get adhoc builds for a site based on current release', note: 'Body: {release, site, edition}' }
      ]
    },
    {
      name: 'Resources',
      icon: 'folder',
      endpoints: [
        { method: 'GET', path: '/auth/userinfo', description: 'Get current user details (used for authentication test)' },
        { method: 'GET', path: '/resources/notes', description: 'Get notes for a specific item', note: 'Body: {key: number}' },
        { method: 'GET', path: '/resources/templates', description: 'Get list of all available templates' },
        { method: 'GET', path: '/resources/templates/1', description: 'Get specific template by ID' }
      ]
    },
    {
      name: 'Data Generation',
      icon: 'description',
      endpoints: [
        { method: 'POST', path: '/pages/workbench', description: 'Get workbench data for user', note: 'Body: {username, release, edition, site, adhockey, lang}' },
        { method: 'POST', path: '/releasenotes', description: 'Generate release highlights or detailed release notes', note: 'Body: {jql, generator, lang, format, release, edition, fixededition}' },
        { method: 'POST', path: '/releasenotes/get', description: 'Get saved highlights', note: 'Body: {taskid, generator, format}' },
        { method: 'POST', path: '/pages/save', description: 'Save generated highlights', note: 'Body: {taskid, title, generator, approvededition, approvedrelease}' },
        { method: 'PUT', path: '/pages/public/85', description: 'Publish saved highlights (taskid 85)', note: 'Set taskid in URL path' },
        { method: 'PUT', path: '/releasenotes/refresh/TC-490767', description: 'Refresh JIRA cache for specific issue', note: 'Set JIRA key in URL path' }
      ]
    },
    {
      name: 'Extract & Export',
      icon: 'upload',
      endpoints: [
        { method: 'PUT', path: '/export/115', description: 'Export to Confluence (taskid 115)', note: 'Set taskid in URL path. Requires ISC credentials token.' }
      ]
    },
    {
      name: 'Analytics & Metrics',
      icon: 'analytics',
      endpoints: [
        { method: 'POST', path: '/metrics/query', description: 'Get system overview metrics', note: 'Body: {site, startDateStr}' },
        { method: 'POST', path: '/metrics/session', description: 'Get session metrics for user', note: 'Body: {username, site}' },
        { method: 'POST', path: '/metrics', description: 'Get release metrics', note: 'Body: {release, edition, site}' }
      ]
    },
    {
      name: 'Authentication',
      icon: 'key',
      endpoints: [
        { method: 'POST', path: '/auth/token', description: 'Get authentication token', note: 'Body: {username, password}. No auth required.' }
      ]
    }
  ];

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadConfig();
  }

  checkAuthentication(): void {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      this.message = '⚠️ You are not logged in. Please log in to use TrakIntel configuration.';
      this.messageType = 'error';
    } else {
      try {
        const user = JSON.parse(userStr);
        if (!user.access_token) {
          this.message = '⚠️ Authentication token not found. Please log in again.';
          this.messageType = 'error';
        }
      } catch (e) {
        this.message = '⚠️ Invalid authentication data. Please log in again.';
        this.messageType = 'error';
      }
    }
  }

  loadConfig(): void {
    this.apiService.get('/api/trakintel/config').subscribe({
      next: (config: any) => {
        this.trakintelUrl = config.trakintel_url || this.trakintelUrl;
        this.trakintelToken = config.trakintel_token || '';
      },
      error: (err) => console.log('No saved config')
    });
  }

  handleSave(): void {
    this.saving = true;
    this.message = 'Saving configuration...';
    this.messageType = 'info';

    this.apiService.post('/api/trakintel/config', {
      trakintel_url: this.trakintelUrl,
      trakintel_token: this.trakintelToken
    }).subscribe({
      next: () => {
        this.message = '✓ Configuration saved successfully! You can now test individual endpoints below.';
        this.messageType = 'success';
        this.saving = false;
      },
      error: (err) => {
        this.message = `✗ Error saving configuration: ${err.error?.detail || err.error?.message || 'Unknown error'}`;
        this.messageType = 'error';
        this.saving = false;
      }
    });
  }

  testEndpoint(endpoint: any): void {
    this.testingEndpoint = endpoint.path;
    this.requestBody = this.getRequestBodyPlaceholder(endpoint);
  }

  cancelTest(): void {
    this.testingEndpoint = null;
    this.requestBody = '';
  }

  getRequestBodyPlaceholder(endpoint: any): string {
    if (endpoint.note && endpoint.note.includes('Body:')) {
      const bodyPart = endpoint.note.split('Body:')[1].trim();
      try {
        // Try to parse and pretty-print if it's JSON-like
        const jsonMatch = bodyPart.match(/\{[^}]+\}/);
        if (jsonMatch) {
          return JSON.stringify(JSON.parse(jsonMatch[0].replace(/'/g, '"')), null, 2);
        }
      } catch (e) {
        // Fall back to the original text
      }
      return bodyPart;
    }
    return '{}';
  }

  executeTest(endpoint: any): void {
    this.executingTest = true;

    // Parse request body if needed
    let body = null;
    if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
      try {
        body = this.requestBody ? JSON.parse(this.requestBody) : {};
      } catch (e) {
        this.snackBar.open('Invalid JSON in request body', 'Close', { duration: 3000 });
        this.executingTest = false;
        return;
      }
    }

    // Use backend proxy to avoid CORS issues
    this.apiService.post('/api/trakintel/test-endpoint', {
      method: endpoint.method,
      path: endpoint.path,
      body: body
    }).subscribe({
      next: (response: any) => {
        this.testResults[endpoint.path] = JSON.stringify(response, null, 2);
        this.snackBar.open('Test successful!', 'Close', { duration: 3000 });
        this.executingTest = false;
        this.testingEndpoint = null;
      },
      error: (err) => {
        let errorMessage = `Error: ${err.status || 0} ${err.statusText || 'Unknown Error'}`;
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage += `\n\n${err.error}`;
          } else {
            errorMessage += `\n\n${JSON.stringify(err.error, null, 2)}`;
          }
        }
        if (err.status === 0) {
          errorMessage += '\n\nThis might be a CORS or network connectivity issue. Please check:\n1. TrakIntel server is running and accessible\n2. Backend proxy is properly configured\n3. Network connection is stable';
        }
        this.testResults[endpoint.path] = errorMessage;
        this.snackBar.open('Test failed - see response below', 'Close', { duration: 3000 });
        this.executingTest = false;
        this.testingEndpoint = null;
      }
    });
  }

  clearTestResult(path: string): void {
    delete this.testResults[path];
  }
}
