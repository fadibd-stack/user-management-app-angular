import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Country, CountryCreate, CountryUpdate } from '../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private readonly baseUrl = '/api/countries';

  constructor(private apiService: ApiService) {}

  getCountries(): Observable<Country[]> {
    return this.apiService.get<Country[]>(this.baseUrl);
  }

  getCountry(id: number): Observable<Country> {
    return this.apiService.get<Country>(`${this.baseUrl}/${id}`);
  }

  createCountry(country: CountryCreate): Observable<Country> {
    return this.apiService.post<Country>(this.baseUrl, country);
  }

  updateCountry(id: number, country: CountryUpdate): Observable<Country> {
    return this.apiService.put<Country>(`${this.baseUrl}/${id}`, country);
  }

  deleteCountry(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
}
