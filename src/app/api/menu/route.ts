// src/app/api/menu/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();
const createMenuSchema = z
    .object({
        name: z.string().min(1, "Nama kategori wajib diisi"),
        description: z.string().min(1, "Deskripsi kategori wajib diisi"),
        price: z.number().min(1, "Harga kategori wajib diisi"),
        stock: z.number().min(1, "Stok kategori wajib diisi"),
        imageUrl: z.string().min(1, "URL gambar kategori wajib diisi"),
        categoryId: z.number().min(1, "Kategori kategori wajib diisi"),
    })
    .strict();

/**
 * @desc    Mengambil daftar semua menu
 * @route   GET /api/menu
 * @access  Public
 */
export async function GET() {
    try {
        const menuItems = await prisma.menu.findMany({
            where: {
                stock: { gt: 0 },
            },
        });
        return NextResponse.json({
            status: 200,
            message: "Berhasil mengambil data menu.",
            data: menuItems,
        });
    } catch (error) {
        return NextResponse.json({
            status: 500,
            error: "Gagal mengambil data menu.",
        });
    }
}

/**
 * @desc    Menambah menu baru
 * @route   POST /api/menu
 * @access  Admin
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = createMenuSchema.safeParse(body);

        if (!validation.success) {
            const formattedErrors = validation.error.issues.map((issue) => ({
                message: issue.message.replace(/\"/g, ""),
            }));
            return NextResponse.json({
                status: 400,
                message: "Format tidak sesuai.",
                errors: formattedErrors,
            });
        }

        const { name, description, price, stock, categoryId } = validation.data;

        const newMenu = await prisma.menu.create({
            data: {
                name,
                description,
                price,
                stock,
                categoryId,
            },
        });

        return NextResponse.json({
            status: 200,
            message: "Menu baru berhasil ditambahkan.",
            data: newMenu,
        })
    } catch (error) {
        console.error("Gagal menambahkan menu baru:", error);
        return NextResponse.json({
            status: 500,
            message: "Gagal menambahkan menu baru. Pastikan nama menu unik.",
        });
    }
}
