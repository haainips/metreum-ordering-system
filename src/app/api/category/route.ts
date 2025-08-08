import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();
const createCategorySchema = z.object({
    name: z.string().min(1, "Nama kategori tidak boleh kosong."),
}).strict();

/**
 * @desc    Menambah category baru
 * @route   POST /api/category
 * @access  Admin
 */

export async function GET() {
    try {
        const categories = await prisma.category.findMany();
        return NextResponse.json({
            status: 200,
            message: "Berhasil mengambil data kategori",
            data: categories,
        });
    } catch (error) {
        return NextResponse.json({
            status: 500,
            error: "Gagal mengambil data kategori",
        });
    }
}

/**
 * @desc    Menambah category baru
 * @route   POST /api/category
 * @access  Admin
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = createCategorySchema.safeParse(body);

        if (!validation.success) {
            // Mengembalikan pesan error jika validasi gagal
            const formattedErrors = validation.error.issues.map((issue) => ({
                message: issue.message.replace(/\"/g, ""),
            }));
            return NextResponse.json(
                {
                    status: 400,
                    message: "Format tidak sesuai.",
                    errors: formattedErrors
                },
            );
        }

        // Jika validasi berhasil, ambil data yang sudah divalidasi
        const { name } = validation.data;

        const newCategory = await prisma.category.create({
            data: { name },
        });

        return NextResponse.json(
            {
                status: 200,
                message: "Kategori baru berhasil ditambahkan.",
                data: newCategory,
            });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            status: 500,
            message: "Gagal menambahkan kategori. Pastikan nama unik."
        })
    }
}



