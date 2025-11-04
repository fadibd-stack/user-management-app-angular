import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { CodeTablesListComponent } from './code-tables-list.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-code-tables-tabs',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    CodeTablesListComponent
  ],
  template: `
    <div class="code-tables-tabs-container">
      <div class="page-header">
        <div>
          <h2>Code Tables</h2>
          <p>Manage system-wide lookup values and configurations</p>
        </div>
      </div>

      <mat-card class="tabs-card">
        <mat-tab-group>
          <mat-tab label="Group Roles">
            <div class="tab-content">
              <app-code-tables-list [tableId]="6" [hideHeader]="true"></app-code-tables-list>
            </div>
          </mat-tab>

          <mat-tab label="Priority Levels">
            <div class="tab-content">
              <app-code-tables-list [tableId]="2" [hideHeader]="true"></app-code-tables-list>
            </div>
          </mat-tab>

          <mat-tab label="System Areas">
            <div class="tab-content">
              <app-code-tables-list [tableId]="1" [hideHeader]="true"></app-code-tables-list>
            </div>
          </mat-tab>

          <mat-tab label="Task Assignment Statuses">
            <div class="tab-content">
              <app-code-tables-list [tableId]="3" [hideHeader]="true"></app-code-tables-list>
            </div>
          </mat-tab>

          <mat-tab label="Task Types">
            <div class="tab-content">
              <app-code-tables-list [tableId]="4" [hideHeader]="true"></app-code-tables-list>
            </div>
          </mat-tab>

          <mat-tab label="Test Execution Statuses">
            <div class="tab-content">
              <app-code-tables-list [tableId]="5" [hideHeader]="true"></app-code-tables-list>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .code-tables-tabs-container {
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .page-header h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1976d2;
    }

    .page-header p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .tabs-card {
      padding: 0;
    }

    .tab-content {
      padding: 24px 0;
    }
  `]
})
export class CodeTablesTabsComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}
}
