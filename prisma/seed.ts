/* eslint-disable no-console */
// prisma/seed.ts
import prisma from "@/infrastructure/prisma/PrismaClient";
import { Prisma } from "../generated/prisma/client";

function newOrderCode(prefix = "ORD") {
  // 6 char alfanumerik uppercase
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function ensureTable(number: number, qrcode?: string) {
  // qrcode harus unik (String) & required di schema kamu
  const qr = qrcode ?? `metreum:table:${number}`;
  const up = await prisma.table.upsert({
    where: { number }, // number unik → aman untuk upsert
    update: {
      isActive: true,
      qrcode: qr,
    },
    create: {
      number,
      qrcode: qr,
      isActive: true,
    },
    select: { id: true, number: true, qrcode: true },
  });
  return up.id; // String cuid()
}

async function getMenuSnapshot(menuId: number) {
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    select: { id: true, name: true, price: true, available: true },
  });
  if (!menu) throw new Error(`Menu id ${menuId} tidak ditemukan`);
  return { id: menu.id, price: menu.price, available: menu.available };
}

type SeedOrderInput = {
  tableId: string;
  orderCode?: string;
  status?: string;            // default: "PENDING"
  customerName?: string | null;
  items: Array<{ menuId: number; qty: number; price?: number; note?: string | null }>;
};

async function upsertOrderWithItems(tx: Prisma.TransactionClient, input: SeedOrderInput) {
  // ambil harga menu jika tidak dipassing (snapshot)
  const itemsWithPrice = await Promise.all(
    input.items.map(async (it) => {
      if (typeof it.price === "number") return it;
      const snap = await getMenuSnapshot(it.menuId);
      return { ...it, price: snap.price };
    })
  );

  const total = itemsWithPrice.reduce((acc, it) => acc + it.qty * (it.price as number), 0);

  const code = input.orderCode ?? newOrderCode();

  // upsert order (by unique orderCode), lalu reset items
  const order = await tx.order.upsert({
    where: { orderCode: code },
    update: {
      tableId: input.tableId,
      status: input.status ?? "PENDING",
      customerName: input.customerName ?? null,
      totalPrice: total,
    },
    create: {
      orderCode: code,
      tableId: input.tableId,
      status: input.status ?? "PENDING",
      customerName: input.customerName ?? null,
      totalPrice: total,
    },
    select: { id: true, orderCode: true },
  });

  // Hapus items lama (jika ada) → kemudian create ulang (unique(orderId, menuId) aman)
  await tx.orderItem.deleteMany({ where: { orderId: order.id } });

  for (const it of itemsWithPrice) {
    await tx.orderItem.create({
      data: {
        orderId: order.id,
        menuId: it.menuId,
        quantity: it.qty,
        price: it.price as number, // snapshot harga
        note: it.note ?? null,
      },
    });
  }

  return order;
}

async function main() {
  // --- VALIDASI minimal: pastikan Menu id=1 ada ---
  const menu1 = await prisma.menu.findUnique({ where: { id: 1 }, select: { id: true } });
  if (!menu1) {
    throw new Error("Menu id=1 tidak ada. Buat dulu menu id=1 atau sesuaikan seed.");
  }

  // --- Pastikan table (meja) ada: pakai nomor 1 dulu ---
  const tableId1 = await ensureTable(1, "metreum:qrcode:table:1");

  // --- Buat 2 order contoh: PENDING & PAID ---
  await prisma.$transaction(async (tx) => {
    // Order 1: PENDING, customerName optional
    await upsertOrderWithItems(tx, {
      tableId: tableId1,
      orderCode: "ORD-SEED-01", // tetap; idempotent
      status: "PENDING",
      customerName: "Andi",
      items: [
        { menuId: 1, qty: 2 }, // harga di-snapshot dari menu saat ini
      ],
    });

    // Order 2: PAID
    await upsertOrderWithItems(tx, {
      tableId: tableId1,
      orderCode: "ORD-SEED-02",
      status: "PAID",
      customerName: "Sinta",
      items: [
        { menuId: 1, qty: 1, note: "Less sugar" },
      ],
    });
  });

  console.log("✅ Seeding Order selesai: ORD-SEED-01 & ORD-SEED-02");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
