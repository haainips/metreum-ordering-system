import { orderUseCasesFactory } from "@/application/order";
import { OrderListItemDTO } from "@/application/order/contracts";
import { authOptions } from "@/lib/auth/options";
import OrdersFilter from "@/ui/dashboard/OrderFilter";
import RecentOrdersCard from "@/ui/dashboard/RecentOrdersCard";
import { CircleAlert, Clock4 } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import OrdersCardsClient from "./OrdersPageClient";

type PageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    cursor?: string | string[];
  }>;
};

export default async function OrdersPage({searchParams}: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");


  const sp = await searchParams;
  const status = Array.isArray(sp.status) ? sp.status[0] : sp.status;

  const { listOrders } = orderUseCasesFactory();
  const { data } = await listOrders.exec({ take: 50, status }, session.user.role as any);
  const rows: OrderListItemDTO[] = data
    .filter((o) => o.id != null)
    .map((o) => ({
      id: o.id as number,
      orderCode: o.orderCode,
      customerName: o.customerName,
      tableId: o.tableId, 
      status: o.status,
      totalPrice: o.totalPrice,
      createdAt: o.createdAt,
      itemsCount: o.itemsCount,
      tableNumber: o.tableNumber as number,
    }));

    const pendingCount = rows.filter((o) => o.status === "PENDING").length;
    const completeCount = rows.filter((o) => o.status === "COMPLETED").length;
  return (
    <div className="h-full space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Kelola Pesanan</h2>
        <p className="text-gray-500 mb-4">Kelola dan pantau semua pesanan pelanggan</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex justify-between items-center bg-amber-50 border px-6 py-6 rounded-xl border-amber-100">
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-700">Pesanan Baru</p>
            <p className="text-3xl font-bold text-amber-900">{pendingCount}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-2xl">
            <CircleAlert className="text-amber-600"/>
          </div>
        </div>
        <div className="flex justify-between items-center bg-blue-50 border px-6 py-6 rounded-xl border-blue-100">
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-700">Pesanan Baru</p>
            <p className="text-3xl font-bold text-blue-900">{completeCount}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-2xl">
            <Clock4 className="text-blue-600"/>
          </div>
        </div>
      </div>
      <OrdersFilter/>
      <OrdersCardsClient initialOrders={rows} />
    </div>
  );
}
