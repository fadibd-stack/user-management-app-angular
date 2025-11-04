import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../services/auth.service';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';

interface MenuItem {
  path?: string;
  label: string;
  icon?: string;
  collapsible?: boolean;
  subitems?: MenuItem[];
  queryParams?: { [key: string]: any };
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  show?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatExpansionModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  styleUrls: ['./main-layout.component.scss'],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" [opened]="sidenavOpened" class="sidenav">
        <div class="logo" [class.logo-collapsed]="!sidenavOpened">
          <img src="assets/intellicare-logo.svg" alt="IntelliCare" class="logo-image" />
          <p class="logo-subtitle">Release Assistant</p>
        </div>

        <div class="menu-search" *ngIf="sidenavOpened">
          <mat-form-field appearance="outline" class="search-menu-field">
            <mat-icon matPrefix class="menu-search-icon">search</mat-icon>
            <input matInput placeholder="Search" [(ngModel)]="menuSearchQuery" (input)="onMenuSearch()" class="menu-search-input">
            <button mat-icon-button matSuffix *ngIf="menuSearchQuery" (click)="clearMenuSearch()" class="clear-search">
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>
        </div>

        <mat-nav-list>
          <!-- Classic Menu Style -->
          @if (useClassicMenu) {
            @for (section of filteredMenuSections; track section.title) {
              <!-- Section Header - Clickable to expand/collapse -->
              <div class="classic-section-header" (click)="toggleSection(section.title)">
                <mat-icon class="section-chevron">{{ isSectionExpanded(section.title) ? 'expand_more' : 'chevron_right' }}</mat-icon>
                <span>{{ section.title }}</span>
              </div>

              <!-- Section items - shown when section is expanded -->
              @if (isSectionExpanded(section.title)) {
                @for (item of section.items; track item.label) {
                  @if (item.collapsible) {
                    <!-- Parent item with chevron for expandable menu -->
                    <div class="classic-menu-item classic-menu-parent" (click)="toggleSubsection(item.label)">
                      <mat-icon class="chevron-icon">{{ isSubsectionExpanded(item.label) ? 'expand_more' : 'chevron_right' }}</mat-icon>
                      <span>{{ item.label }}</span>
                    </div>
                    <!-- Subitems shown when expanded -->
                    @if (isSubsectionExpanded(item.label)) {
                      @for (subitem of item.subitems; track subitem.path) {
                        @if (subitem.path) {
                          <span class="classic-menu-item classic-menu-subitem" (click)="navigateToRoute(subitem.path, subitem.queryParams)">
                            {{ subitem.label }}
                          </span>
                        }
                      }
                    }
                  } @else {
                    <!-- Direct menu item without subitems -->
                    @if (item.path) {
                      <span class="classic-menu-item" (click)="navigateToRoute(item.path, item.queryParams)">
                        {{ item.label }}
                      </span>
                    }
                  }
                }
              }
            }
          }

          <!-- Modern Collapsible Menu Style -->
          @if (!useClassicMenu) {
            @for (section of filteredMenuSections; track section.title) {
              <div class="menu-section">
                <div class="section-header" (click)="toggleSection(section.title)">
                  <mat-icon class="expand-icon">{{ isSectionExpanded(section.title) ? 'expand_more' : 'chevron_right' }}</mat-icon>
                  <span class="section-title">{{ section.title }}</span>
                </div>

                @if (isSectionExpanded(section.title)) {
                  <div class="section-items">
                    @for (item of section.items; track item.label) {
                      @if (item.collapsible) {
                        <mat-expansion-panel class="submenu-panel" [expanded]="isSubsectionExpanded(item.label)">
                          <mat-expansion-panel-header (click)="toggleSubsection(item.label)">
                            <mat-panel-title>{{ item.label }}</mat-panel-title>
                          </mat-expansion-panel-header>
                          @for (subitem of item.subitems; track subitem.path) {
                            <a mat-list-item [routerLink]="subitem.path" [queryParams]="subitem.queryParams" routerLinkActive="active" class="submenu-item">
                              <span matListItemTitle>{{ subitem.label }}</span>
                            </a>
                          }
                        </mat-expansion-panel>
                      } @else {
                        <a mat-list-item [routerLink]="item.path" routerLinkActive="active">
                          @if (item.icon) {
                            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                          }
                          <span matListItemTitle>{{ item.label }}</span>
                        </a>
                      }
                    }
                  </div>
                }

                <mat-divider></mat-divider>
              </div>
            }
          }

        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="top-toolbar">
          <div class="left-buttons">
            <button mat-icon-button (click)="toggleSidenav()" class="toolbar-menu-btn">
              <mat-icon>menu</mat-icon>
            </button>
            <button mat-icon-button routerLink="/" class="toolbar-home-btn">
              <mat-icon>home</mat-icon>
            </button>
          </div>

          <div class="search-container">
            <mat-form-field appearance="outline" class="search-field">
              <input matInput placeholder="Search" class="search-input">
              <mat-icon matSuffix class="search-icon">search</mat-icon>
            </mat-form-field>
            <button mat-button class="ai-assistant-btn" (click)="openAIAssistant()">
              <img src="assets/ai-assistant-icon.svg" alt="AI Assistant" class="ai-icon">
            </button>
          </div>

          <div class="user-menu" *ngIf="currentUser">
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
              <mat-icon>account_circle</mat-icon>
              <span class="user-name">{{ currentUser.first_name }} {{ currentUser.last_name }}</span>
              <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="user-menu-header">
                <div class="user-details">
                  <strong>{{ currentUser.first_name }} {{ currentUser.last_name }}</strong>
                  <small>{{ currentUser.email }}</small>
                </div>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item [matMenuTriggerFor]="languageMenu">
                <mat-icon>language</mat-icon>
                <span>Language: {{ getLanguageLabel(currentUser.language) }}</span>
              </button>
              <mat-divider></mat-divider>
              <div class="user-actions">
                <button mat-icon-button (click)="lockSession()" matTooltip="Lock Session" class="action-icon-btn">
                  <mat-icon>lock</mat-icon>
                </button>
                <button mat-icon-button (click)="changePassword()" matTooltip="Change Password" class="action-icon-btn">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-raised-button color="primary" (click)="logout()" class="logout-btn">
                  Logout
                </button>
              </div>
            </mat-menu>
            <mat-menu #languageMenu="matMenu">
              <button mat-menu-item (click)="changeLanguage('en')">
                <mat-icon>{{ currentUser.language === 'en' ? 'check' : '' }}</mat-icon>
                <span>English</span>
              </button>
              <button mat-menu-item (click)="changeLanguage('es')">
                <mat-icon>{{ currentUser.language === 'es' ? 'check' : '' }}</mat-icon>
                <span>Español</span>
              </button>
              <button mat-menu-item (click)="changeLanguage('fr')">
                <mat-icon>{{ currentUser.language === 'fr' ? 'check' : '' }}</mat-icon>
                <span>Français</span>
              </button>
              <button mat-menu-item (click)="changeLanguage('de')">
                <mat-icon>{{ currentUser.language === 'de' ? 'check' : '' }}</mat-icon>
                <span>Deutsch</span>
              </button>
              <button mat-menu-item (click)="changeLanguage('pt')">
                <mat-icon>{{ currentUser.language === 'pt' ? 'check' : '' }}</mat-icon>
                <span>Português</span>
              </button>
            </mat-menu>
          </div>
        </mat-toolbar>

        <div class="content" (click)="onContentClick()">
          <router-outlet></router-outlet>
        </div>

        <!-- AI Assistant Chat Panel -->
        <div class="ai-chat-panel" [class.open]="aiChatOpen">
          <div class="ai-chat-header">
            <h3>AI Assistant</h3>
            <button mat-icon-button (click)="closeAIAssistant()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="ai-chat-messages">
            <div *ngFor="let message of aiMessages" class="ai-message" [class.user]="message.isUser">
              <div class="message-bubble">{{ message.text }}</div>
            </div>
          </div>
          <div class="ai-chat-input">
            <mat-form-field appearance="outline" class="chat-input-field">
              <input matInput placeholder="Type your message..." [(ngModel)]="aiInputText" (keyup.enter)="sendAIMessage()">
              <button mat-icon-button matSuffix (click)="sendAIMessage()" [disabled]="!aiInputText.trim()">
                <mat-icon>send</mat-icon>
              </button>
            </mat-form-field>
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class MainLayoutComponent {
  currentUser: any;
  sidenavOpened = true;
  menuSearchQuery = '';
  useClassicMenu = false;
  expandedSections: { [key: string]: boolean } = {
    'MAIN': true,
    'RELEASE VALIDATION': true,
    'SYSTEM CONFIGURATION': true,
    'ORGANIZATION': true,
    'ADDITIONAL': true,
    'Table Configuration': true
  };

  // AI Chat properties
  aiChatOpen = false;
  aiInputText = '';
  aiMessages: { text: string; isUser: boolean }[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.currentUser = this.authService.currentUserValue;

    // Subscribe to user updates and apply classic menu preference
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Apply user's menu preference from database
      if (user) {
        this.useClassicMenu = user.use_classic_menu ?? false;
      }
    });

    // Initialize menu preference from current user
    if (this.currentUser) {
      this.useClassicMenu = this.currentUser.use_classic_menu ?? false;
    }
  }

  get menuSections(): MenuSection[] {
    const user = this.currentUser;

    const sections: MenuSection[] = [
      {
        title: 'MAIN',
        items: [
          { path: '/', label: 'Dashboard', icon: 'dashboard' },
          { path: '/release-highlights', label: 'Get Release Highlights', icon: 'highlight' },
          { path: '/workbench', label: 'Workbench', icon: 'work' }
        ]
      },
      {
        title: 'RELEASE VALIDATION',
        items: [
          { path: '/team-dashboard', label: 'Team Dashboard', icon: 'analytics' },
          { path: '/test-cases', label: 'Test Cases', icon: 'assignment' },
          { path: '/test-executions', label: 'Test Executions', icon: 'play_circle_filled' },
          { path: '/task-pool', label: 'Task Pool', icon: 'task' },
          { path: '/groups', label: 'Groups & Permissions', icon: 'groups' }, // Moved from ORGANIZATION
          { path: '/advice', label: 'Advice', icon: 'question_answer' },
          { path: '/team-discussions', label: 'Team Discussions', icon: 'forum' }
        ]
      }
    ];

    // Add System Configuration section for InterSystems employees
    if (user?.user_type === 'employee') {
      sections.push({
        title: 'SYSTEM CONFIGURATION',
        items: [
          { path: '/editions', label: 'Editions', icon: 'category' },
          { path: '/releases', label: 'Releases', icon: 'new_releases' },
          { path: '/countries', label: 'Countries', icon: 'public' },
          { path: '/organizations', label: 'Organizations', icon: 'business' },
          { path: '/employees', label: 'Employees', icon: 'badge' },
          { path: '/components', label: 'System Areas', icon: 'dashboard_customize' },
          { path: '/org-code-tables', label: 'Code Tables', icon: 'table_chart' },
          { path: '/impact-score-config', label: 'Impact Score Settings', icon: 'assessment' }
        ]
      });
    }

    // Add Organization section for org/system admins
    if (
      user?.permission_level === 'org_admin' ||
      user?.permission_level === 'system_admin' ||
      user?.is_superuser ||
      user?.is_org_admin
    ) {
      sections.push({
        title: 'ORGANIZATION',
        items: [
          { path: '/contacts', label: 'Contacts', icon: 'contacts' },
          { path: '/environments', label: 'Environments', icon: 'dns' }
        ]
      });
    }

    // Additional section - only for InterSystems employees
    if (user?.user_type === 'employee') {
      const additionalItems: MenuItem[] = [
        { path: '/functions', label: 'Functions', icon: 'functions' },
        { path: '/jira-dashboard', label: 'JIRA Dashboard', icon: 'bar_chart' },
        { path: '/jira', label: 'JIRA Issues', icon: 'bug_report' },
        { path: '/jira-config', label: 'JIRA Configuration', icon: 'settings' },
        { path: '/trakintel-config', label: 'Trakintel Configuration', icon: 'tune' },
        { path: '/audit-trail', label: 'Audit Trail', icon: 'history' },
        { path: '/api-docs', label: 'API Documentation', icon: 'code' }
      ];

      sections.push({
        title: 'ADDITIONAL',
        items: additionalItems
      });
    }

    return sections;
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  closeSidenavOnMobile(): void {
    // Close sidenav on mobile devices when a menu item is clicked
    if (window.innerWidth < 768) {
      this.sidenavOpened = false;
    }
  }

  preventFocus(event: MouseEvent): void {
    // Prevent the element from receiving focus to avoid blue highlight
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    if (target) {
      target.blur();
    }
  }

  navigateToRoute(path: string, queryParams?: any): void {
    // Navigate programmatically and close sidenav on mobile
    this.router.navigate([path], { queryParams });
    this.closeSidenavOnMobile();
  }

  toggleSection(section: string): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  toggleSubsection(subsection: string): void {
    this.expandedSections[subsection] = !this.expandedSections[subsection];
  }

  isSectionExpanded(section: string): boolean {
    return this.expandedSections[section] !== false;
  }

  isSubsectionExpanded(subsection: string): boolean {
    return this.expandedSections[subsection] !== false;
  }

  get filteredMenuSections(): MenuSection[] {
    if (!this.menuSearchQuery || this.menuSearchQuery.trim() === '') {
      return this.menuSections;
    }

    const query = this.menuSearchQuery.toLowerCase().trim();
    const filtered: MenuSection[] = [];

    for (const section of this.menuSections) {
      const filteredItems: MenuItem[] = [];

      for (const item of section.items) {
        // Check if the item label matches
        if (item.label.toLowerCase().includes(query)) {
          filteredItems.push(item);
        } else if (item.subitems) {
          // Check subitems
          const filteredSubitems = item.subitems.filter(subitem =>
            subitem.label.toLowerCase().includes(query)
          );

          if (filteredSubitems.length > 0) {
            // Include the parent item with filtered subitems
            filteredItems.push({
              ...item,
              subitems: filteredSubitems
            });
          }
        }
      }

      if (filteredItems.length > 0) {
        filtered.push({
          ...section,
          items: filteredItems
        });
        // Auto-expand sections when searching
        this.expandedSections[section.title] = true;
        // Auto-expand collapsible items
        filteredItems.forEach(item => {
          if (item.collapsible) {
            this.expandedSections[item.label] = true;
          }
        });
      }
    }

    return filtered;
  }

  onMenuSearch(): void {
    // Trigger filtering by accessing the getter
    // The getter will automatically filter based on menuSearchQuery
  }

  clearMenuSearch(): void {
    this.menuSearchQuery = '';
  }

  logout(): void {
    this.authService.logout();
  }

  onContentClick(): void {
    if (this.sidenavOpened) {
      this.sidenavOpened = false;
    }
  }

  changePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '500px'
    });
  }

  lockSession(): void {
    // Navigate to login screen without clearing user data
    this.router.navigate(['/login']);
  }

  openAIAssistant(): void {
    this.aiChatOpen = true;
    // Add welcome message if first time opening
    if (this.aiMessages.length === 0) {
      this.aiMessages.push({
        text: 'Hello! I\'m your AI Assistant. How can I help you today?',
        isUser: false
      });
    }
  }

  closeAIAssistant(): void {
    this.aiChatOpen = false;
  }

  sendAIMessage(): void {
    if (!this.aiInputText.trim()) return;

    // Add user message
    this.aiMessages.push({
      text: this.aiInputText,
      isUser: true
    });

    // Simulate AI response
    setTimeout(() => {
      this.aiMessages.push({
        text: 'This is a demo response. AI Assistant integration coming soon!',
        isUser: false
      });
    }, 500);

    this.aiInputText = '';
  }

  getLanguageLabel(code: string): string {
    const languages: { [key: string]: string } = {
      'en': 'English',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
      'pt': 'Português'
    };
    return languages[code] || code;
  }

  changeLanguage(language: string): void {
    if (!this.currentUser) return;

    this.http.put(`http://localhost:8000/users/${this.currentUser.id}`, {
      language: language
    }).subscribe({
      next: (updatedUser: any) => {
        // Update current user in localStorage and auth service
        this.currentUser = { ...this.currentUser!, language: language };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.snackBar.open(`Language changed to ${this.getLanguageLabel(language)}`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error changing language:', err);
        this.snackBar.open('Failed to change language', 'Close', { duration: 3000 });
      }
    });
  }
}
