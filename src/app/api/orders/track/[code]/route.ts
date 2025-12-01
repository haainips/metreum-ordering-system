// app/api/orders/[id]/route.ts
import prisma from "@/infrastructure/prisma/PrismaClient";


// app/api/orders/by-code/[code]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const order = await prisma.order.findUnique({
    where: { orderCode: params.code },
    // ... include
  });
  // ... response
}