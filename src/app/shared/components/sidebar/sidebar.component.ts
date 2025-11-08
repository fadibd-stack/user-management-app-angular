import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { MenuSection } from '../../../core/models/menu.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  menuSections: MenuSection[] = [];

  expandedSections: { [key: string]: boolean } = {
    'MAIN': true,
    'RELEASE_VALIDATION': true,
    'SYSTEM_CONFIGURATION': true,
    'ORGANIZATION': true,
    'ADDITIONAL': true
  };

  constructor(
    public authService: AuthService,
    private router: Router,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    // Load menus from database based on user permissions
    this.menuService.getMenusForCurrentUser().subscribe({
      next: (sections) => {
        this.menuSections = sections;
        console.log('Loaded menu sections from database:', sections);
      },
      error: (error) => {
        console.error('Error loading menu sections:', error);
        this.menuSections = [];
      }
    });
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
