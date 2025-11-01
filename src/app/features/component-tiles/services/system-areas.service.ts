import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SystemArea } from '../models/system-area.model';

@Injectable({
  providedIn: 'root'
})
export class SystemAreasService {
  constructor(private apiService: ApiService) {}

  getSystemAreas(): Observable<SystemArea[]> {
    return this.apiService.get<SystemArea[]>('/api/system-areas');
  }
}
