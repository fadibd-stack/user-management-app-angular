import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-jira-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="config-container">
      <h2>Jira Configuration</h2>
      <mat-card *ngIf="message" [class]="'message-' + messageType">{{ message }}</mat-card>
      <mat-card class="config-form">
        <form (ngSubmit)="handleSave()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Jira URL *</mat-label>
            <input matInput [(ngModel)]="jiraUrl" name="jiraUrl" placeholder="https://your-domain.atlassian.net" required>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>API Token *</mat-label>
            <input matInput type="password" [(ngModel)]="jiraApiToken" name="jiraApiToken" required>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Project Key</mat-label>
            <input matInput [(ngModel)]="jiraProject" name="jiraProject" placeholder="e.g., PROJ">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Issue Types</mat-label>
            <input matInput [(ngModel)]="jiraIssueTypes" name="jiraIssueTypes" placeholder="Bug,Feature">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>JQL Filter</mat-label>
            <input matInput [(ngModel)]="jiraJql" name="jiraJql" placeholder="ORDER BY updated DESC">
          </mat-form-field>
          <div class="actions">
            <button mat-raised-button type="button" (click)="handleTest()" [disabled]="testing">
              {{ testing ? 'Testing...' : 'Test Connection' }}
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save Configuration' }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .config-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    h2 { font-size: 28px; font-weight: 600; margin-bottom: 24px; }
    .message-success { background-color: #d4edda; color: #155724; padding: 16px; margin-bottom: 24px; }
    .message-error { background-color: #f8d7da; color: #721c24; padding: 16px; margin-bottom: 24px; }
    .message-info { background-color: #d1ecf1; color: #0c5460; padding: 16px; margin-bottom: 24px; }
    .config-form { padding: 24px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .actions { display: flex; gap: 16px; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class JiraConfigComponent implements OnInit {
  jiraUrl = '';
  jiraApiToken = '';
  jiraProject = '';
  jiraIssueTypes = 'Bug,Feature';
  jiraJql = 'ORDER BY updated DESC';
  loading = true;
  saving = false;
  testing = false;
  message = '';
  messageType = 'info';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.apiService.get('/api/jira/config').subscribe({
      next: (config: any) => {
        this.jiraUrl = config.jira_url || '';
        this.jiraApiToken = config.jira_api_token || '';
        this.jiraProject = config.jira_project || '';
        this.jiraIssueTypes = config.jira_issue_types || 'Bug,Feature';
        this.jiraJql = config.jira_jql || 'ORDER BY updated DESC';
        this.loading = false;
      },
      error: (err) => { console.log('No saved config'); this.loading = false; }
    });
  }

  handleSave(): void {
    if (!this.jiraUrl || !this.jiraApiToken) {
      this.message = 'Please fill in all required fields';
      this.messageType = 'error';
      return;
    }

    this.saving = true;
    this.apiService.post('/api/jira/config', {
      jira_url: this.jiraUrl,
      jira_api_token: this.jiraApiToken,
      jira_project: this.jiraProject,
      jira_issue_types: this.jiraIssueTypes,
      jira_jql: this.jiraJql
    }).subscribe({
      next: () => {
        this.message = 'Configuration saved successfully!';
        this.messageType = 'success';
        this.saving = false;
      },
      error: (err) => {
        this.message = 'Error saving configuration';
        this.messageType = 'error';
        this.saving = false;
      }
    });
  }

  handleTest(): void {
    this.testing = true;
    this.message = 'Testing connection...';
    this.messageType = 'info';

    this.apiService.post('/api/jira/test-connection', {
      jira_url: this.jiraUrl,
      jira_api_token: this.jiraApiToken
    }).subscribe({
      next: (res: any) => {
        this.message = `✓ Connection successful! ${res.message || 'API is accessible'}`;
        this.messageType = 'success';
        this.testing = false;
      },
      error: (err) => {
        this.message = '✗ Connection failed';
        this.messageType = 'error';
        this.testing = false;
      }
    });
  }
}
