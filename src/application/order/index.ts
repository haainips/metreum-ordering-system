// src/application/orders/index.ts
import { PrismaOrderRepository } from "@/infrastructure/prisma/PrismaOrderRepository";
import { GetOrderByCode } from "./usecases/GetOrderByCode";
import { GetOrderDetail } from "./usecases/GetOrderDetail";
import { ListOrders } from "./usecases/ListOrders";

export function orderUseCasesFactory() {
  const repo = new PrismaOrderRepository();
  return {
    getOrderByCode: new GetOrderByCode(repo),
    getOrderDetail: new GetOrderDetail(repo),
    listOrders: new ListOrders(repo),
  };
}
