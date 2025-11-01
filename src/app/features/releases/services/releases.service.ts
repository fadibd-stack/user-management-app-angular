import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Release } from '../models/release.model';

export interface ReleaseCreate {
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface ReleaseUpdate {
  code?: string;
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface SyncResponse {
  status: string;
  message: string;
  created: number;
  updated: number;
  total_synced: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReleasesService {
  private readonly baseUrl = '/api/releases';

  constructor(private apiService: ApiService) {}

  /**
   * Get all releases
   */
  getReleases(): Observable<Release[]> {
    return this.apiService.get<Release[]>(this.baseUrl);
  }

  /**
   * Get release by ID
   */
  getRelease(id: number): Observable<Release> {
    return this.apiService.get<Release>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new release
   */
  createRelease(release: ReleaseCreate): Observable<Release> {
    return this.apiService.post<Release>(this.baseUrl, release);
  }

  /**
   * Update existing release
   */
  updateRelease(id: number, release: ReleaseUpdate): Observable<Release> {
    return this.apiService.put<Release>(`${this.baseUrl}/${id}`, release);
  }

  /**
   * Delete release
   */
  deleteRelease(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Sync releases from Trakintel API
   * Returns sync statistics (created, updated counts)
   */
  syncFromTrakintel(): Observable<SyncResponse> {
    return this.apiService.post<SyncResponse>(`${this.baseUrl}/sync-from-trakintel`, {});
  }
}
