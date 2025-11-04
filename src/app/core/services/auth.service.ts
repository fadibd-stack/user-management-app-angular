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
      this.currentUserSubject.next(user);
      this.loadingSubject.next(false);
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      this.logout();
      this.loadingSubject.next(false);
    }
  }

  refreshCurrentUser(): Observable<User> {
    const currentUserId = this.currentUser?.id;
    if (!currentUserId) {
      return of(null as any);
    }

    return this.apiService.get<User>(`/api/users/${currentUserId}`).pipe(
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
}
