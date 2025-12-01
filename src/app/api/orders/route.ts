import { NextRequest, NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma/PrismaClient";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

const orderItemSchema = z.object({
  menuItemId: z.number().int(),
  quantity: z.number().int().min(1, "Kuantitas harus minimal 1."),
});

const orderCreateSchema = z.object({
  customerName: z.string().optional(),
  tableNumber: z.string(),
  items: z
    .array(orderItemSchema)
    .min(1, "Pesanan harus memiliki minimal satu item."),
});

function orderCodeGenerator(date = new Date()) {
  const parts = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Jakarta",
  }).formatToParts(date);

  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${day}${month}`;
}

function fourDigit() {
  return Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
}

function buildOrderCode() {
  return `ORDER-${orderCodeGenerator()}-${fourDigit()}`;
}

/**
 * @desc    Membuat pesanan
 * @route   POST /api/orders
 * @access  Admin
 */

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unauthorized",
      },
      { status: 401 }
    );
  };
  try {
    const body = await request.json();
    const validation = orderCreateSchema.safeParse(body);

    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((issue) => ({
        message: issue.message.replace(/\"/g, ""),
      }));
      return NextResponse.json(
        {
          status: "error",
          message: "Validasi gagal.",
          errors: formattedErrors,
        },
        { status: 400 }
      );
    }

    const { customerName, tableNumber, items } = validation.data;

    const newOrder = await prisma.$transaction(async (tx) => {
      let totalPrice = 0;
      for (const item of items) {
        const menuItem = await tx.menu.findUnique({
          where: { id: item.menuItemId },
        });

        if (!menuItem || !menuItem.available) {
          throw new Error(`${menuItem?.name} tidak tersedia.`);
        }
        totalPrice += menuItem.price * item.quantity;
      }

      const orderCode = buildOrderCode();
      const createdOrder = await tx.order.create({
        data: {
          customerName,
          orderCode,
          tableId: tableNumber,
          totalPrice,
          OrderItems: {
            createMany: {
              data: items.map((item) => ({
                menuId: item.menuItemId,
                quantity: item.quantity,
                price: 0,
              })),
            },
          },
        },
        include: { OrderItems: true },
      });
      return createdOrder;
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Pesanan berhasil dibuat.",
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Gagal membuat pesanan.",
      },
      { status: 400 }
    );
  }
}

/**
 * @desc    Mengambil semua pesanan
 * @route   GET /api/orders
 * @access  Admin
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unauthorized",
      },
      { status: 401 }
    );
  };
  try {
    const orders = await prisma.order.findMany({
      include: {
        OrderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });
    return NextResponse.json(
      {
        status: "success",
        message: "Data pesanan berhasil diambil.",
        data: orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: error,
        message: "Gagal mengambil data pesanan.",
      },
      { status: 500 }
    );
  }
}
