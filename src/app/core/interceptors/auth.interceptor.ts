import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip adding headers for auth requests
  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }

  // Add X-User-ID header if user is logged in
  const user = authService.currentUser;
  if (user) {
    req = req.clone({
      setHeaders: {
        'X-User-ID': user.id.toString()
      }
    });
  }

  return next(req);
};
