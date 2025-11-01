import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TeamDiscussion } from '../models/discussion.model';

@Injectable({
  providedIn: 'root'
})
export class TeamDiscussionsService {
  private readonly baseUrl = '/api/team-discussions';

  constructor(private apiService: ApiService) {}

  getDiscussions(): Observable<TeamDiscussion[]> {
    return this.apiService.get<TeamDiscussion[]>(this.baseUrl);
  }
}
