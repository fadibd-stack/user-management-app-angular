import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TeamSummary } from '../models/team-summary.model';

@Injectable({
  providedIn: 'root'
})
export class TeamDashboardService {
  private readonly baseUrl = '/api/dashboard/team-summary';

  constructor(private apiService: ApiService) {}

  getTeamSummary(range: string = '7d', groupId?: number): Observable<TeamSummary> {
    const params: any = { range };
    if (groupId) {
      params.group_id = groupId;
    }
    return this.apiService.get<TeamSummary>(this.baseUrl, params);
  }
}
