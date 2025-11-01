import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CodeTableType, CodeTableValue, CodeTableValueCreate, CodeTableValueUpdate } from '../models/code-table.model';

@Injectable({
  providedIn: 'root'
})
export class CodeTablesService {
  private readonly typesUrl = '/api/code-table-types';
  private readonly valuesUrl = '/api/code-table-values';

  constructor(private apiService: ApiService) {}

  getTypes(): Observable<CodeTableType[]> {
    return this.apiService.get<CodeTableType[]>(this.typesUrl);
  }

  getValues(tableTypeCode?: string): Observable<CodeTableValue[]> {
    const url = tableTypeCode
      ? `${this.valuesUrl}?table_type_code=${tableTypeCode}`
      : this.valuesUrl;
    return this.apiService.get<CodeTableValue[]>(url);
  }

  getValue(id: number): Observable<CodeTableValue> {
    return this.apiService.get<CodeTableValue>(`${this.valuesUrl}/${id}`);
  }

  createValue(value: CodeTableValueCreate): Observable<CodeTableValue> {
    return this.apiService.post<CodeTableValue>(this.valuesUrl, value);
  }

  updateValue(id: number, value: CodeTableValueUpdate): Observable<CodeTableValue> {
    return this.apiService.put<CodeTableValue>(`${this.valuesUrl}/${id}`, value);
  }

  deleteValue(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.valuesUrl}/${id}`);
  }
}
