import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

export interface StockUpdate {
  productId: number;
  newStock: number;
}

@Injectable({ providedIn: 'root' })
export class StockService implements OnDestroy {
  private readonly socket: Socket = io(environment.wsUrl, {
    transports: ['websocket'],
    autoConnect: true,
  });

  onStockUpdated(): Observable<StockUpdate> {
    return new Observable((observer) => {
      this.socket.on('stock:updated', (data: StockUpdate) => observer.next(data));
      return () => this.socket.off('stock:updated');
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
