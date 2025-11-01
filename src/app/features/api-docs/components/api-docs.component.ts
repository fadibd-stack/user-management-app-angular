import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-api-docs',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="api-docs-container">
      <div class="page-header">
        <h2>API Documentation</h2>
        <p>Interactive API documentation powered by Swagger UI</p>
      </div>

      <mat-card class="iframe-card">
        <iframe
          [src]="apiDocsUrl"
          class="api-iframe"
          title="API Documentation"
        ></iframe>
      </mat-card>

      <mat-card class="info-card">
        <h3>Direct Access</h3>
        <p>
          <strong>Swagger UI:</strong>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
            http://localhost:8000/docs
          </a>
        </p>
        <p>
          <strong>ReDoc:</strong>
          <a href="http://localhost:8000/redoc" target="_blank" rel="noopener noreferrer">
            http://localhost:8000/redoc
          </a>
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .api-docs-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-header h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; }
    .page-header p { margin: 0; color: #666; }
    .iframe-card { padding: 0; overflow: hidden; margin-bottom: 24px; }
    .api-iframe { width: 100%; height: 800px; border: none; display: block; }
    .info-card { padding: 24px; }
    .info-card h3 { margin: 0 0 16px 0; font-size: 18px; font-weight: 600; }
    .info-card p { margin-bottom: 12px; font-size: 14px; }
    .info-card a { color: #1976d2; text-decoration: none; font-weight: 500; }
    .info-card a:hover { text-decoration: underline; }
  `]
})
export class ApiDocsComponent {
  apiDocsUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.apiDocsUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:8000/docs');
  }
}
