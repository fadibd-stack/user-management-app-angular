import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TaskAssignment } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskPoolService {
  private readonly baseUrl = '/api/task-assignments';

  constructor(private apiService: ApiService) {}

  getTasks(): Observable<TaskAssignment[]> {
    return this.apiService.get<TaskAssignment[]>(this.baseUrl);
  }

  claimTask(taskId: number): Observable<TaskAssignment> {
    return this.apiService.post<TaskAssignment>(`${this.baseUrl}/${taskId}/claim`, {});
  }

  unclaimTask(taskId: number): Observable<void> {
    return this.apiService.post<void>(`${this.baseUrl}/${taskId}/unclaim`, {});
  }
}
