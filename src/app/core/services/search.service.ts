import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SearchResult {
  id: number | string;
  name: string;
  type: string;
  category: string;
  route: string;
  email?: string;
  code?: string;
  sitecode?: string;
  status?: string;
  isQuickLink?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  search(query: string, limit: number = 5): Observable<SearchResponse> {
    return this.http.get<SearchResponse>(`${this.apiUrl}/api/search`, {
      params: {
        q: query,
        limit: limit.toString()
      }
    });
  }
}
