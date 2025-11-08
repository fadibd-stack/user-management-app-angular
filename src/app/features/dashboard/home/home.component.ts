import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentUser: any;
  loading = true;
  hasMenuAccess = true;  // Track if user has any menu access

  // System-wide stats
  counts: any = {};
  userStats: any = {};
  recentActivity: any = {};
  recentReleases: any[] = [];
  recentOrganizations: any[] = [];

  private apiUrl = environment.apiUrl || 'http://localhost:8000';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private menuService: MenuService
  ) {
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    // Check if user has any menu access
    this.menuService.getMenusForCurrentUser().subscribe({
      next: (sections) => {
        this.hasMenuAccess = sections.length > 0;
        if (this.hasMenuAccess) {
          this.loadSystemOverview();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.hasMenuAccess = false;
        this.loading = false;
      }
    });
  }

  loadSystemOverview(): void {
    this.loading = true;

    this.http.get<any>(`${this.apiUrl}/api/dashboard/system-overview`).subscribe({
      next: (data) => {
        console.log('Dashboard API Response:', data);
        console.log('Counts:', data.counts);
        this.counts = data.counts || {};
        this.userStats = data.user_stats || {};
        this.recentActivity = data.recent_activity || {};
        this.recentReleases = data.recent_releases || [];
        this.recentOrganizations = data.recent_organizations || [];
        console.log('After assignment - this.counts:', this.counts);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading system overview:', err);
        this.loading = false;
      }
    });
  }

  get isEmployee(): boolean {
    return this.currentUser?.user_type === 'employee';
  }

  get isSystemAdmin(): boolean {
    return this.currentUser?.is_system_admin === true;
  }
}
