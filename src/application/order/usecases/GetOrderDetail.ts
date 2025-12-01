// src/application/orders/usecases/GetOrderDetail.ts
import { IOrderRepository } from "@/domain/orders/IOrderRepository";
import { OrderPolicy, Role } from "@/domain/orders/OrderPolicy";

export class GetOrderDetail {
  constructor(private repo: IOrderRepository) {}
  async exec(id: number, role: Role) {
    if (!OrderPolicy.adminCanRead(role)) throw new Error("FORBIDDEN");
    const order = await this.repo.findById(id);
    if (!order) throw new Error("NOT_FOUND");
    return order.value;
  }
}
