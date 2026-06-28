import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Paginated, Sale } from './models';

export interface SaleLineInput {
  productId: number;
  quantity: number;
}

export interface SaleQuery {
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sales`;

  create(items: SaleLineInput[]): Observable<Sale> {
    return this.http.post<Sale>(this.baseUrl, { items });
  }

  list(query: SaleQuery = {}): Observable<Paginated<Sale>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<Paginated<Sale>>(this.baseUrl, { params });
  }

  get(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/${id}`);
  }
}
