import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { WorkbenchRequest, WorkbenchResponse, ImpactThresholds } from '../models/workbench.model';

@Injectable({
  providedIn: 'root'
})
export class WorkbenchService {
  constructor(private apiService: ApiService) {}

  fetchWorkbench(request: WorkbenchRequest): Observable<WorkbenchResponse> {
    return this.apiService.post<WorkbenchResponse>('/api/trakintel/workbench', request);
  }

  getImpactThresholds(): Observable<ImpactThresholds> {
    return this.apiService.get<ImpactThresholds>('/api/impact-score-config');
  }
}
