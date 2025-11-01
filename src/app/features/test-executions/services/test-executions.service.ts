import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TestExecution, TestExecutionCreate, TestExecutionUpdate } from '../models/test-execution.model';

@Injectable({
  providedIn: 'root'
})
export class TestExecutionsService {
  private readonly baseUrl = '/api/test-executions';

  constructor(private apiService: ApiService) {}

  getExecutions(): Observable<TestExecution[]> {
    return this.apiService.get<TestExecution[]>(this.baseUrl);
  }

  getExecution(id: number): Observable<TestExecution> {
    return this.apiService.get<TestExecution>(`${this.baseUrl}/${id}`);
  }

  getExecutionsByTestCase(testCaseId: number): Observable<TestExecution[]> {
    return this.apiService.get<TestExecution[]>(`${this.baseUrl}?test_case_id=${testCaseId}`);
  }

  createExecution(execution: TestExecutionCreate): Observable<TestExecution> {
    return this.apiService.post<TestExecution>(this.baseUrl, execution);
  }

  updateExecution(id: number, execution: TestExecutionUpdate): Observable<TestExecution> {
    return this.apiService.put<TestExecution>(`${this.baseUrl}/${id}`, execution);
  }

  deleteExecution(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
}
