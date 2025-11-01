import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Environment } from '../models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentsService {
  private readonly baseUrl = '/api/environments';

  constructor(private apiService: ApiService) {}

  getEnvironments(): Observable<Environment[]> {
    return this.apiService.get<Environment[]>(this.baseUrl);
  }
}
