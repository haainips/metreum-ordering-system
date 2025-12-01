// src/domain/orders/IOrderRepository.ts
import { Order } from "./Order";

export interface OrderListParams {
  q?: string;              // search by code / table name
  status?: string;         // single status (atau array, sesuai selera)
  tableId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  take?: number;
  cursor?: number | null;  // cursor-based pagination (id)
}

export interface IOrderRepository {
  findById(id: number): Promise<Order | null>;
  findByCode(code: string): Promise<Order | null>;
  list(params: OrderListParams): Promise<{ data: Order[]; nextCursor: number | null }>;
}
