import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UsersService } from '../services/users.service';
import { User } from '../models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserFormComponent } from './user-form.component';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDialogModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatOptionModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="users-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>{{ pageTitle }}</h2>
            <p>{{ pageSubtitle }}</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="openUserDialog()">
              <mat-icon>add</mat-icon>
              Add User
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Tabs - Only for superusers on legacy /users route -->
      <mat-tab-group *ngIf="currentUser?.is_superuser && viewMode === 'all'" [(selectedIndex)]="selectedTabIndex" (selectedIndexChange)="onTabChange()">
        <mat-tab label="Organization Users"></mat-tab>
        <mat-tab label="System Users"></mat-tab>
      </mat-tab-group>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Loading users...</p>
      </mat-card>

      <mat-card class="table-card">
        <!-- Search Bar and Filters -->
        <div class="search-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search Users</mat-label>
            <input matInput [(ngModel)]="searchTerm" (input)="filterUsers()" placeholder="Search by name, username, or email...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <!-- Organization Filter - Only for Employees on Contacts Page -->
          <mat-form-field appearance="outline" class="org-filter-field" *ngIf="viewMode === 'contacts' && currentUser?.user_type === 'employee'">
            <mat-label>Filter by Organization</mat-label>
            <input
              type="text"
              matInput
              [formControl]="orgFilterControl"
              [matAutocomplete]="autoOrg"
              placeholder="Type to search organizations...">
            <mat-icon matSuffix>business</mat-icon>
            <button matSuffix mat-icon-button (click)="clearOrgFilter()" *ngIf="selectedOrgFilter" tabindex="-1">
              <mat-icon>clear</mat-icon>
            </button>
            <mat-autocomplete #autoOrg="matAutocomplete" (optionSelected)="onOrgSelected($event)" [displayWith]="displayOrgName">
              <mat-option [value]="null">All Organizations</mat-option>
              <mat-option *ngFor="let org of filteredOrganizations | async" [value]="org">
                {{ org.name }}
              </mat-option>
            </mat-autocomplete>
          </mat-form-field>
        </div>

        <div *ngIf="loading" style="display: flex; justify-content: center; padding: 48px;">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        </div>

        <table mat-table [dataSource]="dataSource" class="full-width-table" [style.display]="loading ? 'none' : 'table'">
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
            <td mat-cell *matCellDef="let user" class="clickable-name" (click)="viewUserDetail(user)">
              {{ user.first_name }} {{ user.last_name }}
            </td>
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

          <!-- Permission/Role Column -->
          <ng-container matColumnDef="permission_level">
            <th mat-header-cell *matHeaderCellDef>ROLE</th>
            <td mat-cell *matCellDef="let user">
              <span class="code-badge">{{ formatUserRole(user) }}</span>
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

          <!-- Actions Column - removed, actions now in detail page -->
          <!-- <ng-container matColumnDef="actions">
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
          </ng-container> -->

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator
          [pageSizeOptions]="[10, 20, 30, 50]"
          [pageSize]="10"
          [style.display]="loading ? 'none' : 'block'"
          showFirstLastButtons>
        </mat-paginator>

        <div *ngIf="!loading && dataSource.data.length === 0" class="no-data">
          <mat-icon class="no-data-icon">people</mat-icon>
          <p>{{ searchTerm ? 'No users match your search' : 'No users found' }}</p>
          <p class="no-data-hint" *ngIf="!searchTerm">Click "Add User" to create your first user</p>
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

    .search-container {
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px 8px 0 0;
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 0 0 300px;
      min-width: 250px;
    }

    .org-filter-field {
      flex: 1;
      min-width: 450px;
    }

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

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clickable-row:hover {
      background-color: #f5f5f5;
    }

    .clickable-name {
      cursor: pointer;
      color: #1976d2;
      font-weight: 500;
      transition: all 0.2s;
    }

    .clickable-name:hover {
      color: #1565c0;
      text-decoration: underline;
    }
  `]
})
export class UsersListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  users: User[] = [];
  dataSource = new MatTableDataSource<User>([]);
  loading = true;
  currentUser: User | null = null;
  selectedTabIndex = 0;
  searchTerm = '';
  organizations: any[] = [];  // List of organizations for filter dropdown
  selectedOrgFilter: number | string = '';  // Selected organization ID for filtering
  orgFilterControl = new FormControl('');  // FormControl for autocomplete input
  filteredOrganizations!: Observable<any[]>;  // Filtered organizations for autocomplete

  get displayedColumns(): string[] {
    const mode = this.viewMode;

    if (mode === 'employees') {
      // Simplified employees view - just name, email, status
      return [
        'name',
        'email',
        'status'
      ];
    } else if (mode === 'contacts') {
      // Contacts always have organizations - actions removed, now in detail page
      return [
        'username',
        'name',
        'email',
        'permission_level',
        'organization',
        'status'
      ];
    } else {
      // Legacy /users route - show everything, actions removed (now in detail page)
      return [
        'username',
        'name',
        'email',
        'employment_type',
        'permission_level',
        'organization',
        'status'
      ];
    }
  }

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private organizationsService: OrganizationsService
  ) {
    this.currentUser = this.authService.currentUser;

    // Set up custom filter predicate for searching by name, username, or email
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.username.toLowerCase().includes(searchStr) ||
             data.email.toLowerCase().includes(searchStr) ||
             `${data.first_name} ${data.last_name}`.toLowerCase().includes(searchStr);
    };
  }

  get currentRoute(): string {
    return this.router.url;
  }

  get viewMode(): 'employees' | 'contacts' | 'all' {
    if (this.currentRoute.includes('/employees')) {
      return 'employees';
    } else if (this.currentRoute.includes('/contacts')) {
      return 'contacts';
    }
    return 'all';
  }

  get pageTitle(): string {
    const mode = this.viewMode;
    if (mode === 'employees') {
      return 'Employee Management';
    } else if (mode === 'contacts') {
      return 'Contact Management';
    }
    return 'User Management';
  }

  get pageSubtitle(): string {
    const mode = this.viewMode;
    if (mode === 'employees') {
      return 'Manage employees, roles, and permissions';
    } else if (mode === 'contacts') {
      return 'Manage customer contacts and organization access';
    }
    return 'Manage users, roles, and permissions';
  }

  ngOnInit(): void {
    this.loadUsers();

    // Load organizations for filter dropdown (only for employees viewing contacts)
    if (this.viewMode === 'contacts' && this.currentUser?.user_type === 'employee') {
      this.organizationsService.getOrganizations().subscribe({
        next: (orgs) => {
          this.organizations = orgs;

          // Setup autocomplete filtering
          this.filteredOrganizations = this.orgFilterControl.valueChanges.pipe(
            startWith(''),
            map((value: string | any) => {
              let filterValue = '';
              if (typeof value === 'string') {
                filterValue = value;
              } else if (value && value.name) {
                filterValue = value.name;
              }
              return filterValue ? this._filterOrganizations(filterValue) : this.organizations.slice();
            })
          );

          // Detect when field is manually cleared
          this.orgFilterControl.valueChanges.subscribe(value => {
            // If the value is an empty string and we have a filter applied, clear it
            if (value === '' && this.selectedOrgFilter) {
              this.selectedOrgFilter = '';
              this.filterUsers();
            }
          });
        },
        error: (error) => {
          console.error('Failed to load organizations:', error);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    // Set paginator to dataSource after view initialization
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyViewModeFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  onTabChange(): void {
    this.applyViewModeFilter();
  }

  applyViewModeFilter(): void {
    const mode = this.viewMode;
    let filteredUsers: User[] = [];

    if (mode === 'employees') {
      // Show only employees (user_type === 'employee')
      filteredUsers = this.users.filter(u => u.user_type === 'employee');
    } else if (mode === 'contacts') {
      // Show only contacts (user_type === 'contact')
      filteredUsers = this.users.filter(u => u.user_type === 'contact');

      // Apply organization filter if selected (only for employees viewing contacts)
      if (this.selectedOrgFilter && this.currentUser?.user_type === 'employee') {
        filteredUsers = filteredUsers.filter(u => u.organization_id === +this.selectedOrgFilter);
      }
    } else {
      // Legacy /users route - show based on tabs and permissions
      if (!this.currentUser?.is_superuser) {
        // Non-superusers see only organization users (contacts)
        filteredUsers = this.users.filter(u => u.user_type === 'contact');
      } else {
        // Superusers can filter
        if (this.selectedTabIndex === 0) {
          // Organization users (contacts)
          filteredUsers = this.users.filter(u => u.user_type === 'contact');
        } else {
          // System users (employees)
          filteredUsers = this.users.filter(u => u.user_type === 'employee');
        }
      }
    }

    // Update dataSource with filtered users
    this.dataSource.data = filteredUsers;

    // Apply search filter
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();

    // Reset to first page when filtering
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  filterUsers(): void {
    // Reapply all filters when search term or organization filter changes
    this.applyViewModeFilter();
  }

  openUserDialog(user?: User): void {
    // When creating a new user, pass the context of which type to create
    const dialogData = user || {
      _createMode: true,
      _userType: this.viewMode === 'contacts' ? 'contact' : 'employee'
    };

    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: dialogData
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
      this.usersService.deleteUser(user.id, user.user_type as 'employee' | 'contact').subscribe({
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

  formatUserRole(user: any): string {
    // For employees (InterSystems staff), show their employee roles
    if (user.user_type === 'employee') {
      const roles: string[] = [];

      if (user.is_standard) {
        roles.push('Standard');
      }
      if (user.is_system_admin) {
        roles.push('System Admin');
      }
      if (user.is_manager) {
        roles.push('Manager');
      }
      if (user.is_product_manager) {
        roles.push('Product Manager');
      }
      if (user.is_developer) {
        roles.push('Developer');
      }

      // If no roles selected, they are a standard employee
      if (roles.length === 0) {
        return 'No Role Assigned';
      }

      // Join multiple roles with comma
      return roles.join(', ');
    }

    // For contacts (customer users), show org admin or contact
    if (user.user_type === 'contact') {
      return user.is_org_admin ? 'Org Admin' : 'Contact';
    }

    // Fallback to old permission level format for backward compatibility
    return this.formatPermissionLevel(user.permission_level);
  }

  formatPermissionLevel(level: string): string {
    const labels: { [key: string]: string } = {
      'system_admin': 'System Admin',
      'org_admin': 'Org Admin',
      'standard': 'Standard',
      'read_only': 'Read Only',
      'user': 'User'
    };
    return labels[level] || level;
  }

  viewEmployee(user: User): void {
    this.router.navigate(['/employees', user.id]);
  }

  viewUserDetail(user: User): void {
    // Navigate to the appropriate detail page based on user type
    if (user.user_type === 'employee') {
      this.router.navigate(['/employees', user.id]);
    } else if (user.user_type === 'contact') {
      this.router.navigate(['/contacts', user.id]);
    }
  }

  // Organization filter autocomplete methods
  private _filterOrganizations(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.organizations.filter(org =>
      org.name.toLowerCase().includes(filterValue)
    );
  }

  displayOrgName = (org: any): string => {
    return org && org.name ? org.name : '';
  };

  onOrgSelected(event: any): void {
    const selectedOrg = event.option.value;
    this.selectedOrgFilter = selectedOrg ? selectedOrg.id : '';
    this.filterUsers();
  }

  clearOrgFilter(): void {
    this.orgFilterControl.setValue('');
    this.selectedOrgFilter = '';
    this.filterUsers();
  }
}
