import prisma from "@/infrastructure/prisma/PrismaClient";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateCategorySchema = z
  .object({
    name: z.string().min(1, "Nama kategori wajib diisi"),
  })
  .strict(); // untuk menolak field tambahan

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({
        status: 404,
        message: "Kategori tidak ditemukan.",
      });
    }
    return NextResponse.json({
      status: 200,
      message: "Berhasil mengambil data kategori.",
      data: category,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "Terjadi kesalahan saat mengambil kategori.",
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = updateCategorySchema.safeParse(body);

    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message.replace(/\"/g, ""),
      }));
      return NextResponse.json({
        status: 400,
        message: "Validasi gagal.",
        errors: formattedErrors,
      });
    }

    const { name } = validation.data;

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(params.id) },
      data: { name },
    });

    return NextResponse.json({
      status: 200,
      message: "Kategori berhasil diperbarui.",
      data: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "Gagal memperbarui kategori. Pastikan ID valid.",
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.category.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({
      status: 200,
      message: "Kategori berhasil dihapus.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "Gagal menghapus kategori. Pastikan ID valid.",
    });
  }
}
