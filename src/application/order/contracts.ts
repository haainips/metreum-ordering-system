// src/application/orders/contracts.ts
import { table } from "console";
import { z } from "zod";

export const OrderStatusZ = z.enum(["PENDING","PROCESS","COMPLETED","CANCELLED"]);

export const OrderListItemDTO = z.object({
  id: z.number(),
  orderCode: z.string(),
  customerName: z.string(),
  tableId: z.string(),
  status: OrderStatusZ,
  totalPrice: z.number(),
  createdAt: z.string(),      
  tableNumber: z.number(),
  itemsCount: z.number(),
});

export type OrderListItemDTO = z.infer<typeof OrderListItemDTO>;

export const OrderDetailDTO = OrderListItemDTO.extend({
  note: z.string().nullable(),
  OrderItems: z.array(z.object({
    id: z.number(),
    menuId: z.number(),
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
  })).default([]),
});
export type OrderDetailDTO = z.infer<typeof OrderDetailDTO>;
