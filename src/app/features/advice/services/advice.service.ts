import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Advice } from '../models/advice.model';

@Injectable({
  providedIn: 'root'
})
export class AdviceService {
  private readonly baseUrl = '/api/advice';

  constructor(private apiService: ApiService) {}

  getAdvice(status?: string): Observable<Advice[]> {
    const params = status ? { status } : undefined;
    return this.apiService.get<Advice[]>(this.baseUrl, params);
  }

  postMessage(adviceId: number, body: string): Observable<any> {
    return this.apiService.post(`${this.baseUrl}/${adviceId}/messages`, { body });
  }

  answerAdvice(adviceId: number, body: string): Observable<any> {
    return this.apiService.put(`${this.baseUrl}/${adviceId}/answer`, { body });
  }

  resolveAdvice(adviceId: number, resolutionSummary?: string): Observable<any> {
    return this.apiService.post(`${this.baseUrl}/${adviceId}/resolve`, {
      resolution_summary: resolutionSummary || null
    });
  }
}
