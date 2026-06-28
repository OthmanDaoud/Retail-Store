import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: true } })
export class StockGateway {
  @WebSocketServer()
  private readonly server!: Server;

  notifyStockUpdate(productId: number, newStock: number): void {
    this.server.emit('stock:updated', { productId, newStock });
  }
}
