import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GroupsService } from '../services/groups.service';
import { Group } from '../models/group.model';
import { GroupFormComponent } from './group-form.component';

@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="groups-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Groups & Teams</h2>
            <p>Manage testing groups and team members</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="openDialog()">
              <mat-icon>add</mat-icon>
              Add Group
            </button>
          </div>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading groups...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="groups" class="full-width-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>NAME</th>
            <td mat-cell *matCellDef="let group">{{ group.name }}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>DESCRIPTION</th>
            <td mat-cell *matCellDef="let group">{{ group.description || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="group_type">
            <th mat-header-cell *matHeaderCellDef>TYPE</th>
            <td mat-cell *matCellDef="let group">
              <span class="code-badge">{{ (group.group_type | titlecase).toUpperCase() }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="member_count">
            <th mat-header-cell *matHeaderCellDef>MEMBERS</th>
            <td mat-cell *matCellDef="let group">{{ group.member_count || 0 }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let group">
              <mat-chip class="status-chip" [class.active-chip]="group.is_active">
                {{ group.is_active ? 'ACTIVE' : 'INACTIVE' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
            <td mat-cell *matCellDef="let group">
              <button mat-button (click)="editGroup(group)">Edit</button>
              <button mat-button color="warn" (click)="deleteGroup(group)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="groups.length === 0" class="no-data">
          <mat-icon class="no-data-icon">groups</mat-icon>
          <p>No groups found</p>
          <p class="no-data-hint">Click "Add Group" to create your first testing group</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .groups-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }
    .header-actions { display: flex; gap: 12px; }
    .header-actions button { min-width: 140px; }
    .header-actions mat-icon { margin-right: 8px; }

    .loading-card { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .loading-card p { color: #666; margin: 0; }

    .table-card { overflow-x: auto; margin-top: 24px; }
    .full-width-table { width: 100%; }

    .code-badge {
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
      background-color: #e8f5e9;
      color: #2e7d32;
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
  `]
})
export class GroupsListComponent implements OnInit {
  groups: Group[] = [];
  loading = true;
  displayedColumns = ['name', 'description', 'group_type', 'member_count', 'status', 'actions'];

  constructor(
    private groupsService: GroupsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.groupsService.getGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading groups:', err);
        this.loading = false;
      }
    });
  }

  openDialog(group?: Group): void {
    const dialogRef = this.dialog.open(GroupFormComponent, {
      width: '600px',
      data: group || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadGroups();
    });
  }

  editGroup(group: Group): void {
    this.openDialog(group);
  }

  deleteGroup(group: Group): void {
    if (confirm(`Delete group "${group.name}"?`)) {
      this.groupsService.deleteGroup(group.id).subscribe({
        next: () => this.loadGroups(),
        error: (err) => {
          console.error('Error deleting group:', err);
          alert('Failed to delete group.');
        }
      });
    }
  }
}
