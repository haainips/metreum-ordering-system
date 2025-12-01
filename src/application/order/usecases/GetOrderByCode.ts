// src/application/orders/usecases/GetOrderByCode.ts
import { IOrderRepository } from "@/domain/orders/IOrderRepository";
import { OrderPolicy } from "@/domain/orders/OrderPolicy";

export class GetOrderByCode {
  constructor(private repo: IOrderRepository) {}
  async exec(code: string) {
    if (!OrderPolicy.publicCanRead()) throw new Error("FORBIDDEN");
    const order = await this.repo.findByCode(code);
    if (!order) throw new Error("NOT_FOUND");
    return order.value;
  }
}
