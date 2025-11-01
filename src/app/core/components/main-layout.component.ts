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
import { AuthService } from '../services/auth.service';
// import { ChangePasswordDialogComponent } from './change-password-dialog.component';

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
    MatSnackBarModule
  ],
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
              <button mat-menu-item (click)="changePassword()">
                <mat-icon>lock</mat-icon>
                <span>Change Password</span>
              </button>
              <button mat-menu-item (click)="lockSession()">
                <mat-icon>lock_clock</mat-icon>
                <span>Lock Session</span>
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
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
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 280px;
      background: #f5f5f5;
      border-right: 1px solid #e0e0e0;
      overflow-y: auto;
    }

    .logo {
      padding: 12px 16px 8px 16px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .logo.logo-collapsed {
      display: none;
    }

    .logo-image {
      width: 100%;
      max-width: 240px;
      height: auto;
    }

    .logo-subtitle {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #333695;
      text-align: center;
      letter-spacing: 0.5px;
    }

    .menu-search {
      padding: 8px 12px 6px 12px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }

    .search-menu-field {
      width: 100%;
      margin: 0;
      font-size: 13px;
    }

    .search-menu-field ::ng-deep .mat-mdc-form-field-wrapper {
      padding-bottom: 0;
      margin-bottom: 0;
    }

    .search-menu-field ::ng-deep .mat-mdc-form-field-infix {
      padding-top: 6px;
      padding-bottom: 6px;
      min-height: 32px;
    }

    .search-menu-field ::ng-deep .mdc-notched-outline__leading,
    .search-menu-field ::ng-deep .mdc-notched-outline__notch,
    .search-menu-field ::ng-deep .mdc-notched-outline__trailing {
      border-color: #ddd !important;
    }

    .search-menu-field ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: transparent;
    }

    .search-menu-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .menu-search-input {
      font-size: 13px;
      color: #333;
    }

    .menu-search-icon {
      color: #999;
      margin-right: 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .clear-search {
      width: 28px;
      height: 28px;
    }

    .clear-search mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #999;
    }

    mat-nav-list {
      padding: 0 !important;
      margin: 0 !important;
    }

    mat-nav-list ::ng-deep .mat-mdc-list {
      padding: 0 !important;
      margin: 0 !important;
    }

    .menu-section {
      margin: 0 !important;
      padding: 0 !important;
    }

    .section-header {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      background: #e8e8e8;
      transition: background-color 0.2s;
    }

    .section-header:hover {
      background: #d8d8d8;
    }

    .expand-icon {
      margin-right: 6px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #555;
      letter-spacing: 0.5px;
    }

    .section-items {
      background: #fafafa;
    }

    mat-list-item {
      cursor: pointer;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
      padding: 0 !important;
      margin: 0 !important;
      line-height: 36px !important;
      overflow: hidden !important;
      letter-spacing: 0 !important;
    }

    mat-list-item:hover {
      background-color: #e0e0e0;
    }

    mat-list-item ::ng-deep .mat-mdc-list-item-interactive::before {
      height: 36px !important;
      top: 0 !important;
    }

    mat-list-item ::ng-deep .mat-ripple-element {
      height: 36px !important;
    }

    mat-list-item ::ng-deep .mdc-list-item__ripple {
      height: 36px !important;
    }

    /* Force ALL Material list item elements to 36px */
    ::ng-deep .mat-mdc-list-item {
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    ::ng-deep .mat-mdc-list-item.mdc-list-item {
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    ::ng-deep a[mat-list-item] {
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
      padding: 0 !important;
      margin: 0 !important;
      display: block !important;
    }

    ::ng-deep .mat-mdc-list-item-interactive::before {
      height: 36px !important;
    }

    ::ng-deep .mat-mdc-list-item .mat-mdc-list-item-unscoped-content {
      height: 36px !important;
      line-height: 36px !important;
    }

    mat-list-item ::ng-deep .mdc-list-item__content {
      padding: 0 !important;
      margin: 0 !important;
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
      line-height: 36px !important;
      display: flex !important;
      align-items: center !important;
    }

    mat-list-item ::ng-deep .mat-mdc-list-item-unscoped-content {
      padding: 0 16px !important;
      margin: 0 !important;
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
      line-height: 36px !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    mat-list-item ::ng-deep .mat-mdc-list-item-icon {
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 24px !important;
      min-width: 24px !important;
      flex-shrink: 0 !important;
    }

    mat-list-item mat-icon {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      vertical-align: middle !important;
    }

    mat-list-item ::ng-deep span[matlistitemtitle],
    mat-list-item ::ng-deep [matlistitemtitle] {
      line-height: normal !important;
      display: flex !important;
      align-items: center !important;
      padding: 0 !important;
      margin: 0 !important;
      letter-spacing: 0 !important;
      height: 36px !important;
    }

    mat-list-item ::ng-deep .mat-mdc-list-item {
      padding: 0 !important;
      margin: 0 !important;
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
    }

    mat-list-item ::ng-deep a {
      padding: 0 !important;
      margin: 0 !important;
      height: 32px !important;
      line-height: 32px !important;
    }

    mat-list-item.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    mat-list-item.active mat-icon {
      color: #1976d2;
    }

    .submenu-panel {
      box-shadow: none !important;
      margin: 0 !important;
    }

    .submenu-panel ::ng-deep .mat-expansion-panel-header {
      padding: 0 12px !important;
      margin: 0 !important;
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
      font-size: 13px;
      line-height: 36px !important;
    }

    .submenu-panel ::ng-deep .mat-expansion-panel-body {
      padding: 0 !important;
      margin: 0 !important;
    }

    .submenu-item {
      padding-left: 40px !important;
      margin: 0 !important;
      font-size: 13px;
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
      line-height: 36px !important;
    }

    .submenu-item ::ng-deep .mdc-list-item__content {
      padding: 0 !important;
      margin: 0 !important;
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
      line-height: 36px !important;
    }

    .submenu-item ::ng-deep .mat-mdc-list-item-unscoped-content {
      padding: 0 40px !important;
      margin: 0 !important;
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
      line-height: 36px !important;
    }

    mat-divider {
      margin: 0;
    }

    .top-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 42px;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      padding: 0 12px;
    }

    .left-buttons {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .toolbar-menu-btn,
    .toolbar-home-btn {
      color: white;
      width: 38px;
      height: 38px;
      padding: 0;
    }

    .toolbar-menu-btn mat-icon,
    .toolbar-home-btn mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .search-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    .search-field {
      width: 600px;
      max-width: 600px;
      margin: 0;
      margin-top: 5px;
    }

    .search-field ::ng-deep .mat-mdc-form-field-wrapper {
      padding: 0;
      margin: 0;
    }

    .search-field ::ng-deep .mat-mdc-form-field-flex {
      align-items: center;
    }

    .search-field ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: white;
      border-radius: 24px;
    }

    .search-field ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: white;
      border-radius: 24px;
    }

    .search-field ::ng-deep .mdc-notched-outline__leading,
    .search-field ::ng-deep .mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-notched-outline__trailing {
      border-color: transparent !important;
      border-radius: 24px !important;
    }

    .search-field ::ng-deep .mdc-notched-outline__leading {
      border-radius: 24px 0 0 24px !important;
    }

    .search-field ::ng-deep .mdc-notched-outline__trailing {
      border-radius: 0 24px 24px 0 !important;
    }

    .search-field ::ng-deep .mat-mdc-form-field-infix {
      padding-top: 4px;
      padding-bottom: 4px;
      min-height: 28px;
    }

    .search-input {
      color: #333 !important;
      caret-color: #1976d2;
      font-size: 14px;
    }

    .search-input::placeholder {
      color: #999;
    }

    .search-icon {
      color: #666;
      margin-left: 4px;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-menu {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      text-transform: none;
      font-size: 14px;
      color: white;
      border-radius: 8px;
      height: 32px;
      margin: 0;
    }

    .user-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .user-button mat-icon:first-child {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    .user-name {
      font-weight: 500;
      color: white;
    }

    .dropdown-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: rgba(255, 255, 255, 0.8);
    }

    .user-menu-header {
      padding: 6px 12px;
      background-color: #f5f5f5;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0px;
    }

    .user-details strong {
      font-size: 13px;
      color: #333;
    }

    .user-details small {
      font-size: 11px;
      color: #666;
    }

    ::ng-deep .mat-mdc-menu-item {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      font-weight: 400;
    }

    ::ng-deep .mat-mdc-menu-item .mat-icon {
      margin-right: 12px;
      color: rgba(0, 0, 0, 0.54);
    }

    .content {
      min-height: calc(100vh - 42px);
      background: #fafafa;
    }
  `]
})
export class MainLayoutComponent {
  currentUser: any;
  sidenavOpened = true;
  menuSearchQuery = '';
  expandedSections: { [key: string]: boolean } = {
    'MAIN': true,
    'SYSTEM CONFIGURATION': true,
    'ORGANIZATION': true,
    'ADDITIONAL': true,
    'Table Configuration': true
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  get menuSections(): MenuSection[] {
    const user = this.currentUser;

    const sections: MenuSection[] = [
      {
        title: 'MAIN',
        items: [
          { path: '/', label: 'Dashboard', icon: 'dashboard' },
          { path: '/team-dashboard', label: 'Team Dashboard', icon: 'analytics' },
          { path: '/release-highlights', label: 'Get Release Highlights', icon: 'highlight' },
          { path: '/workbench', label: 'Workbench', icon: 'work' },
          { path: '/test-cases', label: 'Test Cases', icon: 'assignment' },
          { path: '/test-executions', label: 'Test Executions', icon: 'play_circle_filled' },
          { path: '/task-pool', label: 'Task Pool', icon: 'task' },
          { path: '/advice', label: 'Advice', icon: 'question_answer' },
          { path: '/team-discussions', label: 'Team Discussions', icon: 'forum' },
          { path: '/functions', label: 'Functions', icon: 'functions' }
        ]
      }
    ];

    // Add System Configuration section for InterSystems employees
    if (user?.employment_type === 'intersystems') {
      sections.push({
        title: 'SYSTEM CONFIGURATION',
        items: [
          { path: '/editions', label: 'Editions', icon: 'category' },
          { path: '/releases', label: 'Releases', icon: 'new_releases' },
          { path: '/countries', label: 'Countries', icon: 'public' },
          { path: '/organizations', label: 'Organizations', icon: 'business' },
          { path: '/users', label: 'Users', icon: 'people' },
          { path: '/components', label: 'System Areas', icon: 'dashboard_customize' },
          { path: '/impact-score-config', label: 'Impact Score Settings', icon: 'assessment' }
        ]
      });
    }

    // Add Org Code Table section for org/system admins
    if (
      user?.permission_level === 'org_admin' ||
      user?.permission_level === 'system_admin' ||
      user?.is_superuser ||
      user?.is_org_admin
    ) {
      sections.push({
        title: 'ORGANIZATION',
        items: [
          { path: '/org-code-tables', label: 'Code Tables', icon: 'table_chart' },
          { path: '/environments', label: 'Environments', icon: 'dns' },
          { path: '/groups', label: 'Groups & Permissions', icon: 'groups' }
        ]
      });
    }

    // Additional section
    const additionalItems: MenuItem[] = [
      { path: '/jira-dashboard', label: 'JIRA Dashboard', icon: 'bar_chart' },
      { path: '/jira', label: 'JIRA Issues', icon: 'bug_report' },
      { path: '/jira-config', label: 'JIRA Configuration', icon: 'settings' },
      { path: '/trakintel-config', label: 'Trakintel Configuration', icon: 'tune' }
    ];

    if (user?.employment_type === 'intersystems') {
      additionalItems.push({ path: '/audit-trail', label: 'Audit Trail', icon: 'history' });
    }

    additionalItems.push({ path: '/api-docs', label: 'API Documentation', icon: 'code' });

    sections.push({
      title: 'ADDITIONAL',
      items: additionalItems
    });

    return sections;
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
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
    this.snackBar.open('Change password feature coming soon!', 'Close', { duration: 3000 });
    // TODO: Implement password change dialog
    // this.dialog.open(ChangePasswordDialogComponent, {
    //   width: '500px'
    // });
  }

  lockSession(): void {
    // Navigate to login screen without clearing user data
    this.router.navigate(['/login']);
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
