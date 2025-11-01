import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Group, GroupMember, GroupCreate, GroupUpdate } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private readonly baseUrl = '/api/groups';

  constructor(private apiService: ApiService) {}

  getGroups(): Observable<Group[]> {
    return this.apiService.get<Group[]>(this.baseUrl);
  }

  getGroup(id: number): Observable<Group> {
    return this.apiService.get<Group>(`${this.baseUrl}/${id}`);
  }

  createGroup(group: GroupCreate): Observable<Group> {
    return this.apiService.post<Group>(this.baseUrl, group);
  }

  updateGroup(id: number, group: GroupUpdate): Observable<Group> {
    return this.apiService.put<Group>(`${this.baseUrl}/${id}`, group);
  }

  deleteGroup(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  getGroupMembers(groupId: number): Observable<GroupMember[]> {
    return this.apiService.get<GroupMember[]>(`${this.baseUrl}/${groupId}/members`);
  }

  addGroupMember(groupId: number, userId: number, isLead: boolean = false): Observable<GroupMember> {
    return this.apiService.post<GroupMember>(`${this.baseUrl}/${groupId}/members`, { user_id: userId, is_lead: isLead });
  }

  removeGroupMember(groupId: number, memberId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${groupId}/members/${memberId}`);
  }
}
