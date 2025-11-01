import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TCFTTriplet, TCFTProduct, TCFTDomain } from '../models/tcft.model';

@Injectable({
  providedIn: 'root'
})
export class TCFTService {
  constructor(private apiService: ApiService) {}

  getTriplets(params?: any): Observable<TCFTTriplet[]> {
    return this.apiService.get<TCFTTriplet[]>('/api/tcft/triplets', params);
  }

  getProducts(): Observable<TCFTProduct[]> {
    return this.apiService.get<TCFTProduct[]>('/api/tcft/products');
  }

  getDomains(productId?: number): Observable<TCFTDomain[]> {
    const params = productId ? { product_id: productId } : undefined;
    return this.apiService.get<TCFTDomain[]>('/api/tcft/domains', params);
  }
}
