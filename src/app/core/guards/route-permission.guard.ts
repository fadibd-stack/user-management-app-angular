import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { MenuService } from '../services/menu.service';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Route permission guard that checks if the user has access to a specific route
 * based on their menu permissions configured in the database.
 */
export const routePermissionGuard: CanActivateFn = (route, state) => {
  const menuService = inject(MenuService);
  const router = inject(Router);

  let currentPath = state.url.split('?')[0]; // Remove query params

  // Extract base path for routes with dynamic segments (e.g., /organizations/4 -> /organizations)
  const pathSegments = currentPath.split('/').filter(s => s);
  if (pathSegments.length > 1 && !isNaN(Number(pathSegments[pathSegments.length - 1]))) {
    // Last segment is a number (likely an ID), use parent path
    currentPath = '/' + pathSegments.slice(0, -1).join('/');
  }

  // Check if user has permission to access this route
  return menuService.hasRouteAccess(currentPath).pipe(
    switchMap(hasAccess => {
      if (hasAccess) {
        return of(true);
      }

      // User doesn't have access - redirect to first allowed menu
      console.warn(`Access denied to ${currentPath}`);

      // Get user's menus and redirect to first allowed one
      return menuService.getMenusForCurrentUser().pipe(
        map(sections => {
          // Find first menu item the user can access
          for (const section of sections) {
            if (section.items && section.items.length > 0) {
              const firstMenu = section.items[0];
              console.log(`Redirecting to first allowed menu: ${firstMenu.path}`);
              setTimeout(() => {
                router.navigate([firstMenu.path], { replaceUrl: true });
              }, 0);
              return false;
            }
          }

          // No menus available - user has no access, just block navigation
          // Don't redirect them anywhere, let them see the "No Access" message in sidebar
          console.warn('No accessible menus found - blocking navigation');
          return false;
        }),
        catchError(() => {
          // If we can't get menus, just block navigation
          console.error('Error fetching menus - blocking navigation');
          return of(false);
        })
      );
    }),
    catchError((error) => {
      // On error, deny access and redirect to login for security
      console.error('Error checking route access:', error);
      setTimeout(() => {
        router.navigate(['/login'], { replaceUrl: true });
      }, 0);
      return of(false);
    })
  );
};
