import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.checkAuth();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  get isIntersystemsEmployee(): boolean {
    return this.currentUser?.user_type === 'employee';
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.apiService.post<User>('/api/auth/login', credentials).pipe(
      tap(user => {
        console.log('AuthService - Login response received:', user);
        console.log('AuthService - access_token present?', !!user.access_token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        console.log('AuthService - User saved to localStorage');
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  checkAuth(): void {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      this.loadingSubject.next(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);

      // Validate JWT token matches localStorage data to prevent ID collision issues
      if (user.access_token) {
        const isValid = this.validateTokenMatchesUser(user);
        if (!isValid) {
          console.error('🚨 TOKEN MISMATCH DETECTED: JWT token does not match localStorage user data');
          console.error('This indicates an ID collision or corrupted session state');
          console.error('Clearing corrupted session and redirecting to login...');
          this.logout();
          this.loadingSubject.next(false);
          return;
        }
      }

      this.currentUserSubject.next(user);
      this.loadingSubject.next(false);
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      this.logout();
      this.loadingSubject.next(false);
    }
  }

  /**
   * Validates that the JWT token payload matches the localStorage user data.
   * This prevents ID collision issues where user_id might be the same across
   * employee and contact tables.
   */
  private validateTokenMatchesUser(user: User): boolean {
    try {
      // Decode JWT token (format: header.payload.signature)
      if (!user.access_token) {
        return false;
      }
      const token: string = user.access_token;
      const parts: string[] = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT token format');
        return false;
      }

      // Decode the payload (Base64URL encoded)
      const payload = JSON.parse(atob(parts[1]));

      // Extract user_id and user_type from token
      const tokenUserId = payload.user_id;
      const tokenUserType = payload.user_type;

      console.log('🔍 Token Validation:');
      console.log('  - Token user_id:', tokenUserId);
      console.log('  - Token user_type:', tokenUserType);
      console.log('  - LocalStorage user_id:', user.id);
      console.log('  - LocalStorage user_type:', user.user_type);

      // Check if token data matches localStorage data
      if (tokenUserId !== user.id) {
        console.error('❌ USER ID MISMATCH: Token user_id does not match localStorage');
        return false;
      }

      if (tokenUserType !== user.user_type) {
        console.error('❌ USER TYPE MISMATCH: Token user_type does not match localStorage');
        return false;
      }

      console.log('✅ Token validation passed');
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  refreshCurrentUser(): Observable<User> {
    const currentUserId = this.currentUser?.id;
    const currentUserType = this.currentUser?.user_type;
    if (!currentUserId || !currentUserType) {
      return of(null as any);
    }

    // Use specific endpoint based on user type to avoid ID collision bug
    const endpoint = currentUserType === 'employee'
      ? `/api/employees/${currentUserId}`
      : `/api/contacts/${currentUserId}`;

    return this.apiService.get<User>(endpoint).pipe(
      tap(user => {
        // Preserve the access_token from the current user
        const currentUser = this.currentUser;
        if (currentUser?.access_token) {
          user.access_token = currentUser.access_token;
        }
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Failed to refresh user:', error);
        return of(this.currentUser as User);
      })
    );
  }

  updateCurrentUser(user: User): void {
    // Preserve the access_token from the current user
    const currentUser = this.currentUser;
    if (currentUser?.access_token) {
      user.access_token = currentUser.access_token;
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  verifyPassword(password: string): Observable<{verified: boolean, is_system_admin: boolean}> {
    return this.apiService.post<{verified: boolean, is_system_admin: boolean}>(
      '/api/auth/verify-password',
      { password }
    );
  }
}
