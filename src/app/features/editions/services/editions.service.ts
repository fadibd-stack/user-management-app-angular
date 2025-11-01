import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Edition } from '../models/edition.model';

export interface EditionCreate {
  code: string;
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface EditionUpdate {
  code?: string;
  name?: string;
  description?: string;
  display_order?: number;
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
export class EditionsService {
  private readonly baseUrl = '/api/editions';

  constructor(private apiService: ApiService) {}

  /**
   * Get all editions
   */
  getEditions(): Observable<Edition[]> {
    return this.apiService.get<Edition[]>(this.baseUrl);
  }

  /**
   * Get edition by ID
   */
  getEdition(id: number): Observable<Edition> {
    return this.apiService.get<Edition>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new edition
   */
  createEdition(edition: EditionCreate): Observable<Edition> {
    return this.apiService.post<Edition>(this.baseUrl, edition);
  }

  /**
   * Update existing edition
   */
  updateEdition(id: number, edition: EditionUpdate): Observable<Edition> {
    return this.apiService.put<Edition>(`${this.baseUrl}/${id}`, edition);
  }

  /**
   * Delete edition
   */
  deleteEdition(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Sync editions from Trakintel API
   * Returns sync statistics (created, updated counts)
   */
  syncFromTrakintel(): Observable<SyncResponse> {
    return this.apiService.post<SyncResponse>(`${this.baseUrl}/sync-from-trakintel`, {});
  }
}
