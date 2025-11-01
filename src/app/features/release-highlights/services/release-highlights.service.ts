import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ReleaseHighlightsRequest, ReleaseHighlightsResponse } from '../models/release-highlights.model';

@Injectable({
  providedIn: 'root'
})
export class ReleaseHighlightsService {
  private readonly baseUrl = '/api/trakintel/highlights';

  constructor(private apiService: ApiService) {}

  generateHighlights(request: ReleaseHighlightsRequest): Observable<ReleaseHighlightsResponse> {
    return this.apiService.post<ReleaseHighlightsResponse>(this.baseUrl, request);
  }
}
