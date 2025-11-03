import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Organization, OrganizationCreate, OrganizationUpdate } from '../models/organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService {
  private readonly baseUrl = '/api/organizations';

  constructor(private apiService: ApiService) {}

  getOrganizations(): Observable<Organization[]> {
    return this.apiService.get<Organization[]>(this.baseUrl);
  }

  getOrganization(id: number): Observable<Organization> {
    return this.apiService.get<Organization>(`${this.baseUrl}/${id}`);
  }

  createOrganization(org: OrganizationCreate): Observable<Organization> {
    return this.apiService.post<Organization>(this.baseUrl, org);
  }

  updateOrganization(id: number, org: OrganizationUpdate): Observable<Organization> {
    return this.apiService.put<Organization>(`${this.baseUrl}/${id}`, org);
  }

  deleteOrganization(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  syncFromTrakIntel(): Observable<{ message: string; created: number; updated: number; total: number }> {
    return this.apiService.post<{ message: string; created: number; updated: number; total: number }>(
      `${this.baseUrl}/sync-from-trakintel`,
      {}
    );
  }
}
