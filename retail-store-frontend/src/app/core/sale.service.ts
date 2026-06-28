import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sale } from './models';

export interface SaleLineInput {
  productId: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sales`;

  create(items: SaleLineInput[]): Observable<Sale> {
    return this.http.post<Sale>(this.baseUrl, { items });
  }

  list(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.baseUrl);
  }

  get(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/${id}`);
  }
}
