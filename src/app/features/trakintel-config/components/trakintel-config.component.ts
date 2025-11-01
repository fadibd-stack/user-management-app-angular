import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-trakintel-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="config-container">
      <h2>TrakIntel Configuration</h2>
      <mat-card *ngIf="message" [class]="'message-' + messageType">{{ message }}</mat-card>
      <mat-card class="config-form">
        <form (ngSubmit)="handleSave()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>TrakIntel URL *</mat-label>
            <input matInput [(ngModel)]="trakintelUrl" name="trakintelUrl" required>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>API Token *</mat-label>
            <input matInput type="password" [(ngModel)]="trakintelToken" name="trakintelToken" required>
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
export class TrakintelConfigComponent implements OnInit {
  trakintelUrl = 'http://ukagilegt01.iscinternal.com/ukagilegt01/aisystem/rest';
  trakintelToken = '';
  saving = false;
  testing = false;
  message = '';
  messageType = 'info';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadConfig();
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
    this.apiService.post('/api/trakintel/config', {
      trakintel_url: this.trakintelUrl,
      trakintel_token: this.trakintelToken
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

    this.apiService.post('/api/trakintel/test-connection', {
      trakintel_url: this.trakintelUrl,
      trakintel_token: this.trakintelToken
    }).subscribe({
      next: (res: any) => {
        this.message = `✓ Connection successful! ${res.message || ''}`;
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
