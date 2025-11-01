import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Project, ProjectCreate, ProjectUpdate } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private readonly baseUrl = '/api/projects';

  constructor(private apiService: ApiService) {}

  getProjects(): Observable<Project[]> {
    return this.apiService.get<Project[]>(this.baseUrl);
  }

  getProject(id: number): Observable<Project> {
    return this.apiService.get<Project>(`${this.baseUrl}/${id}`);
  }

  createProject(project: ProjectCreate): Observable<Project> {
    return this.apiService.post<Project>(this.baseUrl, project);
  }

  updateProject(id: number, project: ProjectUpdate): Observable<Project> {
    return this.apiService.put<Project>(`${this.baseUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
}
