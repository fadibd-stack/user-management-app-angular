import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip adding headers for auth requests
  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }

  // Get the token from localStorage
  const userStr = localStorage.getItem('currentUser');

  if (userStr) {
    try {
      const user = JSON.parse(userStr);

      if (user && user.access_token) {
        // Clone the request and add Authorization header with JWT token
        const clonedReq = req.clone({
          setHeaders: {
            'Authorization': `Bearer ${user.access_token}`,
            'X-User-ID': user.id.toString()
          }
        });
        return next(clonedReq);
      }
    } catch (error) {
      console.error('AuthInterceptor - Error parsing user from localStorage:', error);
    }
  }

  return next(req);
};
