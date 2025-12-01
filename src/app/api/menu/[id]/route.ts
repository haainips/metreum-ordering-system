// app/api/category/[id]/route.ts

import prisma from "@/infrastructure/prisma/PrismaClient";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateMenuSchema = z
    .object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        stock: z.number().int().min(0).optional(),
        imageUrl: z.string().url().optional().nullable(),
        categoryId: z.number().min(1).optional(),
    })
    .strict();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const menu = await prisma.menu.findUnique({
            where: { id },
        })

        if (!menu) {
            return NextResponse.json(
                {
                    status: 404,
                    message: "Kategori tidak ditemukan.",
                });
        }
        return NextResponse.json(
            {
                status: 200,
                message: "Berhasil mengambil data menu.",
                data: menu,
            }
        )
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                status: 500,
                message: "Terjadi kesalahan saat mengambil kategori.",
            }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const validation = updateMenuSchema.safeParse(body);

        if (!validation.success) {
            const formattedErrors = validation.error.issues.map((issue) => ({
                message: issue.message.replace(/\"/g, ""),
            }));
            return NextResponse.json(
                {
                    status: 400,
                    message: "Validasi gagal.",
                    errors: formattedErrors,
                });
        }

        const updatedMenu = await prisma.menu.update({
            where: { id: parseInt(params.id) },
            data:  validation.data ,
        });

        return NextResponse.json(
            {
                status: 200,
                message: "Menu berhasil diperbarui.",
                data: updatedMenu,
            });
    } catch (error) {
        console.error("PATCH Menu Error : ",error);
        return NextResponse.json(
            {
                status: 500,
                message: "Gagal memperbarui menu",
            });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.menu.delete({
            where: { id: parseInt(params.id) },
        });

        return NextResponse.json(
            {
                status: 200,
                message: "Menu berhasil dihapus.",
            });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                status: 500,
                message: "Gagal menghapus Menu",
            });
    }
}
