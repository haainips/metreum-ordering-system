import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateStatusSchema = z.object({
    status: z.enum(["in_progress", "completed", "cancelled"]),
});

/**
 * @desc    Mengambil detail pesanan berdasarkan kode unik
 * @route   GET /api/orders/[code]
 * @access  Admin
 */
export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
    try {
        const orderCode = params.code;

        const order = await prisma.order.findUnique({
            where: { orderCode: orderCode },
            include: {
                OrderItems: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { status: 404, message: "Pesanan tidak ditemukan." }
            );
        }

        return NextResponse.json({
            status: "200",
            message: "Pesanan ditemukan.",
            data: order,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { status: 500, message: "Terjadi kesalahan saat mengambil pesanan." }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const orderCode = params.code;
        const body = await request.json();
        const validation = updateStatusSchema.safeParse(body);

        // 1. Validasi body request
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
        const { status } = validation.data;

        const updatedOrder = await prisma.order.update({
            where: {
                orderCode: orderCode,
                // Pastikan hanya pesanan dengan status 'pending' yang bisa diupdate
                status: "pending",
            },
            data: {
                status: status,
            },
        });

        return NextResponse.json(
            {
                status: 200,
                message: "Status pesanan berhasil diubah.",
                data: updatedOrder,
            }
        );
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json(
                {
                    status: 404,
                    message: "Pesanan tidak ditemukan atau statusnya tidak 'pending'.",
                } 
            );
        }

        console.error(error);
        return NextResponse.json(
            {
                status: 500,
                message: "Terjadi kesalahan saat mengubah status pesanan.",
            }
        );
    }
}