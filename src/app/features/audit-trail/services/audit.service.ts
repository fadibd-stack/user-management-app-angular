import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuditRecord } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly baseUrl = '/api/audit-records';

  constructor(private apiService: ApiService) {}

  getAuditRecords(limit: number = 100, offset: number = 0): Observable<AuditRecord[]> {
    return this.apiService.get<AuditRecord[]>(`${this.baseUrl}?limit=${limit}&offset=${offset}`);
  }
}
