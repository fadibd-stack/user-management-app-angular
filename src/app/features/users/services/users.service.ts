import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { User, UserCreate, UserUpdate } from '../models/user.model';

/**
 * IMPORTANT: The /api/users endpoints are DEPRECATED and kept for backward compatibility only.
 *
 * For new code, always pass the userType parameter to use the specific endpoints:
 * - Use 'employee' for InterSystems staff → calls /api/employees
 * - Use 'contact' for customer users → calls /api/contacts
 *
 * The old /api/users endpoints have an ID collision bug where employee ID 1 and contact ID 1 conflict.
 * Using the specific endpoints prevents this issue.
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly baseUrl = '/api/users'; // DEPRECATED: Kept for legacy compatibility

  constructor(private apiService: ApiService) {}

  /**
   * Get all users
   */
  getUsers(): Observable<User[]> {
    return this.apiService.get<User[]>(this.baseUrl);
  }

  /**
   * Get user by ID
   * Uses the appropriate endpoint based on user_type
   */
  getUser(id: number, userType?: 'employee' | 'contact'): Observable<User> {
    if (userType === 'employee') {
      return this.apiService.get<User>(`/api/employees/${id}`);
    } else if (userType === 'contact') {
      return this.apiService.get<User>(`/api/contacts/${id}`);
    }
    // Fallback to old endpoint if userType not provided
    return this.apiService.get<User>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new user
   * Uses the appropriate endpoint based on user_type
   */
  createUser(user: UserCreate): Observable<User> {
    const userType = user.user_type;

    if (userType === 'employee') {
      return this.apiService.post<User>('/api/employees', user);
    } else if (userType === 'contact') {
      return this.apiService.post<User>('/api/contacts', user);
    }
    // Fallback to old endpoint
    return this.apiService.post<User>(this.baseUrl, user);
  }

  /**
   * Update existing user
   * Uses the appropriate endpoint based on user_type
   */
  updateUser(id: number, user: UserUpdate, userType?: 'employee' | 'contact'): Observable<User> {
    const type = userType || user.user_type;

    if (type === 'employee') {
      return this.apiService.put<User>(`/api/employees/${id}`, user);
    } else if (type === 'contact') {
      return this.apiService.put<User>(`/api/contacts/${id}`, user);
    }
    // Fallback to old endpoint
    return this.apiService.put<User>(`${this.baseUrl}/${id}`, user);
  }

  /**
   * Delete user
   * Uses the appropriate endpoint based on user_type
   */
  deleteUser(id: number, userType?: 'employee' | 'contact'): Observable<void> {
    if (userType === 'employee') {
      return this.apiService.delete<void>(`/api/employees/${id}`);
    } else if (userType === 'contact') {
      return this.apiService.delete<void>(`/api/contacts/${id}`);
    }
    // Fallback to old endpoint
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
}
