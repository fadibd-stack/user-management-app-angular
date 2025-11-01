import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { User, UserCreate, UserUpdate } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly baseUrl = '/api/users';

  constructor(private apiService: ApiService) {}

  /**
   * Get all users
   */
  getUsers(): Observable<User[]> {
    return this.apiService.get<User[]>(this.baseUrl);
  }

  /**
   * Get user by ID
   */
  getUser(id: number): Observable<User> {
    return this.apiService.get<User>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new user
   */
  createUser(user: UserCreate): Observable<User> {
    return this.apiService.post<User>(this.baseUrl, user);
  }

  /**
   * Update existing user
   */
  updateUser(id: number, user: UserUpdate): Observable<User> {
    return this.apiService.put<User>(`${this.baseUrl}/${id}`, user);
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
}
