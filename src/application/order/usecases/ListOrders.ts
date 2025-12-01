// src/application/orders/usecases/ListOrders.ts
import { IOrderRepository, OrderListParams } from "@/domain/orders/IOrderRepository";
import { OrderPolicy, Role } from "@/domain/orders/OrderPolicy";

export class ListOrders {
  constructor(private repo: IOrderRepository) {}
  async exec(params: { q?: string; status?: string; take?: number; cursor?: number | null }, role: Role) {
    if (!OrderPolicy.adminCanRead(role)) throw new Error("FORBIDDEN");
    const result = await this.repo.list(params);
    return {
      data: result.data.map((o) => {
        const v = o.value;
        const itemsCount = (v.OrderItems ??[]).reduce((acc,it) => acc + (it.quantity??0),0);
        return {
          id: v.id!,
          orderCode: v.orderCode,
          customerName: v.customerName,
          tableId: v.tableId,
          status: v.status,
          totalPrice: v.totalPrice,
          createdAt: (v.createdAt ?? new Date()).toISOString(),
          itemsCount,
          tableNumber: v.table?.number ?? String(v.tableId) ,
        }
      }),
      nextCursor: result.nextCursor,
    };
  }
}
