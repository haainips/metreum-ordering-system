import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

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

/**
 * @desc    Membuat pesanan
 * @route   POST /api/orders
 * @access  Admin
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = orderCreateSchema.safeParse(body);

        if (!validation.success) {
            const formattedErrors = validation.error.issues.map((issue) => ({
                message: issue.message.replace(/\"/g, ""),
            }));
            return NextResponse.json(
                {
                    status: 400,
                    message: "Validasi gagal.",
                    errors: formattedErrors,
                },
            );
        }

        const { customerName, tableNumber, items } = validation.data;

        const newOrder = await prisma.$transaction(async (tx) => {
            let totalPrice = 0;
            for (const item of items) {
                const menuItem = await tx.menu.findUnique({
                    where: { id: item.menuItemId },
                });

                if (!menuItem || menuItem.stock < item.quantity) {
                    throw new Error(
                        `Stok untuk ${menuItem?.name || "item"} tidak cukup.`
                    );
                }
                totalPrice += menuItem.price * item.quantity;
            }

            const createdOrder = await tx.order.create({
                data: {
                    customerName,
                    tableNumber,
                    totalPrice,
                    OrderItems: {
                        createMany: {
                            data: items.map((item) => ({
                                menuItemId: item.menuItemId,
                                quantity: item.quantity,
                                priceAtTime: 0, 
                            })),
                        },
                    },
                },
                include: { OrderItems: true },
            });
            return createdOrder;
        });

        return NextResponse.json({
                status: 201,
                message: "Pesanan berhasil dibuat.",
                data: newOrder,
            },
        );
    } catch (error: any) {
        return NextResponse.json(
            { status: 400, message: error.message || "Gagal membuat pesanan." },
        );
    }
}

/**
 * @desc    Mengambil semua pesanan
 * @route   GET /api/orders
 * @access  Admin
 */
export async function GET() {
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
        return NextResponse.json({
            status: 200,
            message: "Data pesanan berhasil diambil.",
            data: orders,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { status: 500, message: "Gagal mengambil data pesanan." },
        );
    }
}
