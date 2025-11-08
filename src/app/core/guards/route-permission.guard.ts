import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { MenuService } from '../services/menu.service';
import { map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Route permission guard that checks if the user has access to a specific route
 * based on their menu permissions configured in the database.
 */
export const routePermissionGuard: CanActivateFn = (route, state) => {
  const menuService = inject(MenuService);
  const router = inject(Router);

  const currentPath = state.url.split('?')[0]; // Remove query params

  // Check if user has permission to access this route
  return menuService.hasRouteAccess(currentPath).pipe(
    map(hasAccess => {
      if (hasAccess) {
        return true;
      }

      // User doesn't have access - redirect to first allowed menu or dashboard
      console.warn(`Access denied to ${currentPath}`);

      // Redirect to dashboard as fallback
      setTimeout(() => {
        router.navigate(['/'], { replaceUrl: true });
      }, 0);

      return false;
    }),
    catchError((error) => {
      // On error, allow access to prevent infinite loops
      console.error('Error checking route access:', error);
      return of(true);
    })
  );
};
