// app/api/orders/[id]/route.ts
import prisma from "@/infrastructure/prisma/PrismaClient";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import z from "zod";
import { fi } from "zod/v4/locales";

const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "PROCESS", "COMPLETED", "CANCELLED"], {
      message: "Status tidak valid",
  }),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        {
          status: "fail",
          message: "ID order tidak valid",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItems: {
          include: {
            menuItem: true, // ✅ Include menu details
          },
        },
        table: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Order tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Order berhasil diambil",
        data: order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        {
          status: "fail",
          message: "ID order tidak valid",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateOrderSchema.safeParse(body);

    if(!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
            {
                  status: "fail",
                  message: "Validasi gagal",
                  errors: formattedErrors,
            },
            { status: 400 }
      )
    }

    const { status } = validation.data;

    if (!status) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Status harus diisi",
        },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

      if (!existingOrder) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Order tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const invalidTransitions: { [key: string]: string[] } = {
      COMPLETED: ["PENDING", "PROCESS", "CANCELLED"],
      CANCELLED: ["PENDING", "PROCESS", "COMPLETED"],
    };

    if (
      invalidTransitions[existingOrder.status]?.includes(status)
    ) {
      return NextResponse.json(
            {
                  status: "fail",
                  message: `Tidak dapat mengubah status dari ${existingOrder.status} ke ${status}`,
            },
            { status: 400 }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        OrderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
    });

      return NextResponse.json(
      {
        status: "success",
        message: "Status berhasil diperbarui",
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
      console.error("Error updating order:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}
