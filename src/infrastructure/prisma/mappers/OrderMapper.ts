// src/infrastructure/prisma/mappers/OrderMapper.ts
import { Order } from "@/domain/orders/Order";

export const OrderMapper = {
  toDomain(row: any): Order {
    return Order.restore({
      id: row.id,
      orderCode: row.orderCode,
      tableId: row.tableId,
      customerName: row.customerName,
      status: row.status,
      totalPrice: row.totalPrice,
      note: row.note,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      OrderItems: row.OrderItems?.map((it: any) => ({
        id: 0,
        menuId: 0,
        name:  "",
        quantity: it.quantity,
        price: 0,
      })),
      table: row.table ? { id: row.table.id, number: row.table.number } : undefined,
    });
  },
};
