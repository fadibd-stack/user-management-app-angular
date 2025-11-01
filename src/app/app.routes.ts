import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './core/components/main-layout.component';
import { HomeComponent } from './features/dashboard/home/home.component';
import { UsersListComponent } from './features/users/components/users-list.component';
import { TestCasesListComponent } from './features/test-cases/components/test-cases-list.component';
import { TestExecutionsListComponent } from './features/test-executions/components/test-executions-list.component';
import { GroupsListComponent } from './features/groups/components/groups-list.component';
import { OrganizationsListComponent } from './features/organizations/components/organizations-list.component';
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

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'users', component: UsersListComponent },
      { path: 'groups', component: GroupsListComponent },
      { path: 'test-cases', component: TestCasesListComponent },
      { path: 'test-executions', component: TestExecutionsListComponent },
      { path: 'task-pool', component: TaskPoolListComponent },
      { path: 'organizations', component: OrganizationsListComponent },
      { path: 'team-discussions', component: TeamDiscussionsListComponent },
      { path: 'team-dashboard', component: TeamDashboardComponent },
      { path: 'projects', component: ProjectsListComponent },
      { path: 'releases', component: ReleasesListComponent },
      { path: 'release-highlights', component: ReleaseHighlightsComponent },
      { path: 'code-tables', component: CodeTablesListComponent },
      { path: 'org-code-tables', component: CodeTablesTabsComponent },
      { path: 'countries', component: CountriesListComponent },
      { path: 'editions', component: EditionsListComponent },
      { path: 'environments', component: EnvironmentsListComponent },
      { path: 'functions', component: FunctionsListComponent },
      { path: 'advice', component: AdviceListComponent },
      { path: 'workbench', component: WorkbenchComponent },
      // Route alias: /components -> component-tiles (for backward compatibility with sidebar)
      { path: 'components', component: ComponentTilesComponent },
      { path: 'component-tiles', redirectTo: 'components' },
      // Route alias: /jira -> jira-issues (for backward compatibility with sidebar)
      { path: 'jira', component: JiraIssuesComponent },
      { path: 'jira-issues', redirectTo: 'jira' },
      { path: 'jira-dashboard', component: JiraDashboardComponent },
      { path: 'api-docs', component: ApiDocsComponent },
      { path: 'jira-config', component: JiraConfigComponent },
      { path: 'trakintel-config', component: TrakintelConfigComponent },
      { path: 'impact-score-config', component: ImpactScoreConfigComponent },
      { path: 'audit-trail', component: AuditTrailListComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
