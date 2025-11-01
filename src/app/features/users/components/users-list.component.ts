import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsersService } from '../services/users.service';
import { User } from '../models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserFormComponent } from './user-form.component';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <div class="users-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>User Management</h2>
            <p>Manage users, roles, and permissions</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="openUserDialog()">
              <mat-icon>add</mat-icon>
              Add User
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Tabs - Only for superusers -->
      <mat-tab-group *ngIf="currentUser?.is_superuser" [(selectedIndex)]="selectedTabIndex" (selectedIndexChange)="onTabChange()">
        <mat-tab label="Organization Users"></mat-tab>
        <mat-tab label="System Users"></mat-tab>
      </mat-tab-group>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
        <p>Loading users...</p>
      </mat-card>

      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="filteredUsers" class="full-width-table">
          <!-- Username Column -->
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>USERNAME</th>
            <td mat-cell *matCellDef="let user">
              <span class="code-badge">{{ user.username }}</span>
            </td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>NAME</th>
            <td mat-cell *matCellDef="let user">{{ user.first_name }} {{ user.last_name }}</td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>EMAIL</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <!-- Employment Type Column -->
          <ng-container matColumnDef="employment_type">
            <th mat-header-cell *matHeaderCellDef>TYPE</th>
            <td mat-cell *matCellDef="let user">
              <mat-chip class="type-chip" [class.intersystems-chip]="user.employment_type === 'intersystems'"
                        [class.customer-chip]="user.employment_type === 'customer'">
                {{ user.employment_type === 'intersystems' ? 'INTERSYSTEMS' : 'CUSTOMER' }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Permission Level Column -->
          <ng-container matColumnDef="permission_level">
            <th mat-header-cell *matHeaderCellDef>PERMISSION</th>
            <td mat-cell *matCellDef="let user">
              <span class="code-badge">{{ formatPermissionLevel(user.permission_level) }}</span>
            </td>
          </ng-container>

          <!-- Organization Column -->
          <ng-container matColumnDef="organization">
            <th mat-header-cell *matHeaderCellDef>ORGANIZATION</th>
            <td mat-cell *matCellDef="let user">{{ user.organization_name || '-' }}</td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let user">
              <mat-chip class="status-chip" [class.active-chip]="user.is_active">
                {{ user.is_active ? 'ACTIVE' : 'INACTIVE' }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
            <td mat-cell *matCellDef="let user">
              <button mat-icon-button (click)="editUser(user)" matTooltip="Edit User">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="changePassword(user)" matTooltip="Change Password">
                <mat-icon>lock_reset</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteUser(user)" matTooltip="Delete User">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="filteredUsers.length === 0" class="no-data">
          <mat-icon class="no-data-icon">people</mat-icon>
          <p>No users found</p>
          <p class="no-data-hint">Click "Add User" to create your first user</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .users-container { padding: 24px; }
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

    .type-chip {
      font-size: 11px;
      font-weight: 600;
      min-height: 24px;
      height: 24px;
    }

    .intersystems-chip {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .customer-chip {
      background-color: #f3e5f5;
      color: #7b1fa2;
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
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  currentUser: User | null = null;
  selectedTabIndex = 0;

  displayedColumns: string[] = [
    'username',
    'name',
    'email',
    'employment_type',
    'permission_level',
    'organization',
    'status',
    'actions'
  ];

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  onTabChange(): void {
    this.filterUsers();
  }

  filterUsers(): void {
    if (!this.currentUser?.is_superuser) {
      // Non-superusers see only organization users
      this.filteredUsers = this.users.filter(u => u.organization_id !== null);
    } else {
      // Superusers can filter
      if (this.selectedTabIndex === 0) {
        // Organization users
        this.filteredUsers = this.users.filter(u => u.organization_id !== null);
      } else {
        // System users
        this.filteredUsers = this.users.filter(u => u.organization_id === null);
      }
    }
  }

  openUserDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: user || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  editUser(user: User): void {
    this.openUserDialog(user);
  }

  changePassword(user: User): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        alert('Password changed successfully!');
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }

  formatPermissionLevel(level: string): string {
    const labels: { [key: string]: string } = {
      'system_admin': 'System Admin',
      'org_admin': 'Org Admin',
      'standard': 'Standard',
      'read_only': 'Read Only'
    };
    return labels[level] || level;
  }
}
