import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TestCase, TestCaseCreate, TestCaseUpdate, SystemArea } from '../models/test-case.model';

@Injectable({
  providedIn: 'root'
})
export class TestCasesService {
  private readonly baseUrl = '/api/test-cases';
  private readonly systemAreasUrl = '/api/code-table-values';

  constructor(private apiService: ApiService) {}

  /**
   * Get all test cases
   */
  getTestCases(): Observable<TestCase[]> {
    return this.apiService.get<TestCase[]>(this.baseUrl);
  }

  /**
   * Get test case by ID
   */
  getTestCase(id: number): Observable<TestCase> {
    return this.apiService.get<TestCase>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new test case
   */
  createTestCase(testCase: TestCaseCreate): Observable<TestCase> {
    return this.apiService.post<TestCase>(this.baseUrl, testCase);
  }

  /**
   * Update existing test case
   */
  updateTestCase(id: number, testCase: TestCaseUpdate): Observable<TestCase> {
    return this.apiService.put<TestCase>(`${this.baseUrl}/${id}`, testCase);
  }

  /**
   * Delete test case
   */
  deleteTestCase(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get system areas (from code tables)
   */
  getSystemAreas(): Observable<SystemArea[]> {
    return this.apiService.get<SystemArea[]>(`${this.systemAreasUrl}?table_type=system_area`);
  }
}
