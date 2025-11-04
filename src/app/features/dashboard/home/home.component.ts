import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../features/users/services/users.service';
import { TestCasesService } from '../../../features/test-cases/services/test-cases.service';
import { OrganizationsService } from '../../../features/organizations/services/organizations.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentUser: any;
  loading = true;
  stats = {
    totalUsers: 0,
    totalTestCases: 0,
    totalOrganizations: 0,
    activeTestCases: 0,
    completedTestCases: 0,
    failedTestCases: 0
  };

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private testCasesService: TestCasesService,
    private organizationsService: OrganizationsService
  ) {
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;

    Promise.all([
      this.usersService.getUsers().toPromise(),
      this.testCasesService.getTestCases().toPromise(),
      this.organizationsService.getOrganizations().toPromise()
    ]).then(([users, testCases, orgs]) => {
      this.stats.totalUsers = users?.length || 0;
      this.stats.totalTestCases = testCases?.length || 0;
      this.stats.totalOrganizations = orgs?.length || 0;

      // Note: TestCase doesn't have status field - status is on TestExecution
      // TODO: Load test execution stats separately
      if (testCases) {
        this.stats.activeTestCases = 0;
        this.stats.completedTestCases = 0;
        this.stats.failedTestCases = 0;
      }

      this.loading = false;
    }).catch(err => {
      console.error('Error loading stats:', err);
      this.loading = false;
    });
  }
}
