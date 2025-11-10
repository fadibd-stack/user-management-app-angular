import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { routePermissionGuard } from './core/guards/route-permission.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './core/components/main-layout.component';
import { HomeComponent } from './features/dashboard/home/home.component';
import { UsersListComponent } from './features/users/components/users-list.component';
import { EmployeeDetailComponent } from './features/users/components/employee-detail.component';
import { ContactDetailComponent } from './features/users/components/contact-detail.component';
import { TestCasesListComponent } from './features/test-cases/components/test-cases-list.component';
import { TestExecutionsListComponent } from './features/test-executions/components/test-executions-list.component';
import { GroupsListComponent } from './features/groups/components/groups-list.component';
import { OrganizationsListComponent } from './features/organizations/components/organizations-list.component';
import { OrganizationDetailComponent } from './features/organizations/components/organization-detail.component';
import { ProjectsListComponent } from './features/projects/components/projects-list.component';
import { CodeTablesListComponent } from './features/code-tables/components/code-tables-list.component';
import { CodeTablesTabsComponent } from './features/code-tables/components/code-tables-tabs.component';
import { TaskPoolListComponent } from './features/task-pool/components/task-pool-list.component';
import { AuditTrailListComponent } from './features/audit-trail/components/audit-trail-list.component';
import { CountriesListComponent } from './features/countries/components/countries-list.component';
import { EditionsListComponent } from './features/editions/components/editions-list.component';
import { EnvironmentsListComponent } from './features/environments/components/environments-list.component';
import { ReleasesListComponent } from './features/releases/components/releases-list.component';
import { TeamDiscussionsListComponent } from './features/team-discussions/components/team-discussions-list.component';
import { TeamDashboardComponent } from './features/team-dashboard/components/team-dashboard.component';
import { ReleaseHighlightsComponent } from './features/release-highlights/components/release-highlights.component';
import { FunctionsListComponent } from './features/functions/components/functions-list.component';
import { AdviceListComponent } from './features/advice/components/advice-list.component';
import { WorkbenchComponent } from './features/workbench/components/workbench.component';
import { ComponentTilesComponent } from './features/component-tiles/components/component-tiles.component';
import { JiraIssuesComponent } from './features/jira-issues/components/jira-issues.component';
import { JiraConfigComponent } from './features/jira-config/components/jira-config.component';
import { TrakintelConfigComponent } from './features/trakintel-config/components/trakintel-config.component';
import { ImpactScoreConfigComponent } from './features/impact-score-config/components/impact-score-config.component';
import { ApiDocsComponent } from './features/api-docs/components/api-docs.component';
import { JiraDashboardComponent } from './features/jira-dashboard/components/jira-dashboard.component';
import { MenuConfigComponent } from './features/menu-config/menu-config.component';
import { SearchConfigComponent } from './features/search-config/components/search-config.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'employees', component: UsersListComponent, canActivate: [routePermissionGuard] },
      { path: 'employees/:id', component: EmployeeDetailComponent, canActivate: [routePermissionGuard] },
      { path: 'contacts', component: UsersListComponent, canActivate: [routePermissionGuard] },
      { path: 'contacts/:id', component: ContactDetailComponent, canActivate: [routePermissionGuard] },
      { path: 'groups', component: GroupsListComponent, canActivate: [routePermissionGuard] },
      { path: 'test-cases', component: TestCasesListComponent, canActivate: [routePermissionGuard] },
      { path: 'test-executions', component: TestExecutionsListComponent, canActivate: [routePermissionGuard] },
      { path: 'task-pool', component: TaskPoolListComponent, canActivate: [routePermissionGuard] },
      { path: 'organizations', component: OrganizationsListComponent, canActivate: [routePermissionGuard] },
      { path: 'organizations/:id', component: OrganizationDetailComponent, canActivate: [routePermissionGuard] },
      { path: 'team-discussions', component: TeamDiscussionsListComponent, canActivate: [routePermissionGuard] },
      { path: 'team-dashboard', component: TeamDashboardComponent, canActivate: [routePermissionGuard] },
      { path: 'projects', component: ProjectsListComponent, canActivate: [routePermissionGuard] },
      { path: 'releases', component: ReleasesListComponent, canActivate: [routePermissionGuard] },
      { path: 'release-highlights', component: ReleaseHighlightsComponent, canActivate: [routePermissionGuard] },
      { path: 'code-tables', component: CodeTablesListComponent, canActivate: [routePermissionGuard] },
      { path: 'org-code-tables', component: CodeTablesTabsComponent, canActivate: [routePermissionGuard] },
      { path: 'countries', component: CountriesListComponent, canActivate: [routePermissionGuard] },
      { path: 'editions', component: EditionsListComponent, canActivate: [routePermissionGuard] },
      { path: 'environments', component: EnvironmentsListComponent, canActivate: [routePermissionGuard] },
      { path: 'functions', component: FunctionsListComponent, canActivate: [routePermissionGuard] },
      { path: 'advice', component: AdviceListComponent, canActivate: [routePermissionGuard] },
      { path: 'workbench', component: WorkbenchComponent, canActivate: [routePermissionGuard] },
      // Route alias: /components -> component-tiles (for backward compatibility with sidebar)
      { path: 'components', component: ComponentTilesComponent, canActivate: [routePermissionGuard] },
      { path: 'component-tiles', redirectTo: 'components' },
      // Route alias: /jira -> jira-issues (for backward compatibility with sidebar)
      { path: 'jira', component: JiraIssuesComponent, canActivate: [routePermissionGuard] },
      { path: 'jira-issues', redirectTo: 'jira' },
      { path: 'jira-dashboard', component: JiraDashboardComponent, canActivate: [routePermissionGuard] },
      { path: 'api-docs', component: ApiDocsComponent, canActivate: [routePermissionGuard] },
      { path: 'jira-config', component: JiraConfigComponent, canActivate: [routePermissionGuard] },
      { path: 'trakintel-config', component: TrakintelConfigComponent, canActivate: [routePermissionGuard] },
      { path: 'impact-score-config', component: ImpactScoreConfigComponent, canActivate: [routePermissionGuard] },
      { path: 'audit-trail', component: AuditTrailListComponent, canActivate: [routePermissionGuard] },
      { path: 'menu-configuration', component: MenuConfigComponent, canActivate: [routePermissionGuard] },
      { path: 'search-configuration', component: SearchConfigComponent, canActivate: [routePermissionGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];
