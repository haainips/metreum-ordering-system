// src/infrastructure/prisma/PrismaOrderRepository.ts
import prisma from "./PrismaClient";
import {
  IOrderRepository,
  OrderListParams,
} from "@/domain/orders/IOrderRepository";
import { Order } from "@/domain/orders/Order";
import { OrderMapper } from "./mappers/OrderMapper";

export class PrismaOrderRepository implements IOrderRepository {
  async findById(id: number): Promise<Order | null> {
    const row = await prisma.order.findUnique({
      where: { id },
      include: {
        OrderItems: { include: { menuItem: true } },
        table: { select: { id: true, number: true } },
      },
    });
    return row ? OrderMapper.toDomain(row) : null;
  }

  async findByCode(code: string): Promise<Order | null> {
    const row = await prisma.order.findUnique({
      where: { orderCode: code },
      include: {
        OrderItems: { include: { menuItem: true } },
        table: { select: { id: true, number: true } },
      },
    });
    return row ? OrderMapper.toDomain(row) : null;
  }

  async list(params: OrderListParams) {
    const take = params.take ?? 20;
    const cursor = params.cursor ? { id: params.cursor } : undefined;

    const q = params.q?.trim();
    const or: any[] = [];

    if (q) {
      // cari by kode order & nama customer (string)
      or.push({ orderCode: { contains: q, mode: "insensitive" } });
      or.push({ customerName: { contains: q, mode: "insensitive" } });
      or.push({ table: { number: { contains: q, mode: "insensitive" } } }); // kalau `Table.number` adalah string

      // kalau user ketik angka, dukung juga pencarian mejaId (INT)
      const qNum = Number(q);
      if (!Number.isNaN(qNum)) {
        or.push({ tableId: qNum });
        // bila `table.number` bertipe string tapi berisi angka, biarkan contains di atas yang match
      }
    }

    const where: any = {
      AND: [
        or.length ? { OR: or } : {},
        params.status ? { status: { equals: params.status } } : {},
        params.tableId ? { tableId: params.tableId } : {},
        params.dateFrom || params.dateTo
          ? {
              createdAt: {
                gte: params.dateFrom ?? undefined,
                lte: params.dateTo ?? undefined,
              },
            }
          : {},
      ],
    };

    const rows = await prisma.order.findMany({
      where,
      take: (params.take ?? 20) + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      orderBy: { id: "desc" },
      include: {
        // gunakan NAMA FIELD RELASI SEBENARNYA (biasanya lowercase)
        table: { select: { id: true, number: true } },
        OrderItems: { select: { quantity: true } },
      },
    });

    const hasNext = rows.length > take;
    const sliced = hasNext ? rows.slice(0, take) : rows;
    const nextCursor = hasNext ? sliced[sliced.length - 1].id : null;

    return { data: sliced.map(OrderMapper.toDomain), nextCursor };
  }
}
