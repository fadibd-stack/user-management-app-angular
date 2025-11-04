import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  path?: string;
  label: string;
  collapsible?: boolean;
  subitems?: MenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  expandedSections: { [key: string]: boolean } = {
    'Main': true,
    'System Configuration': true,
    'Code Tables': true,
    'Organization': true,
    'Additional': true
  };

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  get menuSections(): MenuSection[] {
    const user = this.authService.currentUserValue;
    // DEBUG: Check user data
    console.log('Sidebar - Current user:', user);
    console.log('Sidebar - user_type:', user?.user_type);

    const sections: MenuSection[] = [
      {
        title: 'Main',
        items: [
          { path: '/', label: 'Dashboard' },
          { path: '/team-dashboard', label: 'Team Dashboard' },
          { path: '/release-highlights', label: 'Get Release Highlights' },
          { path: '/workbench', label: 'Workbench' },
          { path: '/test-cases', label: 'Test Cases' },
          { path: '/test-executions', label: 'Test Executions' },
          { path: '/task-pool', label: 'Task Pool' },
          { path: '/advice', label: 'Advice' },
          { path: '/team-discussions', label: 'Team Discussions' },
          { path: '/functions', label: 'Functions' }
        ]
      }
    ];

    // Add System Configuration section for InterSystems employees
    console.log('Sidebar - Checking if employee:', user?.user_type === 'employee');
    if (user?.user_type === 'employee') {
      console.log('Sidebar - Adding System Configuration menu');
      sections.push({
        title: 'System Configuration',
        items: [
          { path: '/editions', label: 'Editions' },
          { path: '/releases', label: 'Releases' },
          { path: '/countries', label: 'Countries' },
          { path: '/organizations', label: 'Organizations' },
          { path: '/users', label: 'Users' },
          { path: '/components', label: 'System Areas' },
          {
            label: 'Code Tables',
            collapsible: true,
            subitems: [
              { path: '/code-tables?table=1', label: 'System Areas' },
              { path: '/code-tables?table=6', label: 'Group Roles' },
              { path: '/code-tables?table=2', label: 'Priority Levels' },
              { path: '/code-tables?table=3', label: 'Task Assignment Statuses' },
              { path: '/code-tables?table=4', label: 'Task Types' },
              { path: '/code-tables?table=5', label: 'Test Execution Statuses' }
            ]
          },
          { path: '/impact-score-config', label: 'Impact Score Settings' }
        ]
      });
    } else {
      console.log('Sidebar - NOT adding System Configuration menu - user_type is:', user?.user_type);
    }

    // Add Organization Admin section for org admins (but not for employees who already have System Configuration)
    if (
      user?.user_type !== 'employee' &&
      (user?.permission_level === 'org_admin' ||
       user?.permission_level === 'system_admin' ||
       user?.is_superuser ||
       user?.is_org_admin)
    ) {
      sections.push({
        title: 'Organization',
        items: [
          { path: '/environments', label: 'Environments' },
          { path: '/groups', label: 'Groups & Permissions' }
        ]
      });
    }

    // Additional section
    const additionalItems: MenuItem[] = [
      { path: '/jira-dashboard', label: 'JIRA Dashboard' },
      { path: '/jira', label: 'JIRA Issues' },
      { path: '/jira-config', label: 'JIRA Configuration' },
      { path: '/trakintel-config', label: 'Trakintel Configuration' }
    ];

    if (user?.user_type === 'employee') {
      additionalItems.push({ path: '/audit-trail', label: 'Audit Trail' });
    }

    additionalItems.push({ path: '/api-docs', label: 'API Documentation' });

    sections.push({
      title: 'Additional',
      items: additionalItems
    });

    return sections;
  }

  toggleSection(section: string): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  isSectionExpanded(section: string): boolean {
    return this.expandedSections[section] || false;
  }

  onClose(): void {
    this.close.emit();
  }

  onLinkClick(): void {
    this.close.emit();
  }

  isActiveRoute(path: string): boolean {
    return this.router.url === path;
  }
}
