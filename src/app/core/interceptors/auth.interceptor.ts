import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip adding headers for auth requests
  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }

  // Get user from localStorage and add X-User-ID header
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      req = req.clone({
        setHeaders: {
          'X-User-ID': user.id.toString()
        }
      });
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
    }
  }

  return next(req);
};
