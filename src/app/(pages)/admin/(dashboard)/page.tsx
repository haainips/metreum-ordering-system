import { ShoppingCart, ListChecks, TrendingUp, Coffee } from "lucide-react";
import "@/app/globals.css";
import { orderUseCasesFactory } from "@/application/order";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import OrdersCard from "@/ui/dashboard/OrdersCard";

type OrderRow = {
  id: number;
  orderCode: string;
  tableId: string;
  status: "PENDING" | "PROCESS" | "COMPLETED" | "CANCELLED";
  totalPrice: number;
  createdAt: string;
  itemsCount: number;
  tableNumber: number;
};

export default async function DashboardPage({
  order,
}: {
  order: OrderRow[];
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { listOrders } = orderUseCasesFactory();
  const { data } = await listOrders.exec({ take: 6 }, session.user.role as any);

  const rows: OrderRow[] = data
    .filter((o) => o.id != null)
    .map((o) => ({
      id: o.id as number, // sekarang definite
      orderCode: o.orderCode,
      tableId: o.tableId, // kamu memang pakai string
      status: o.status,
      totalPrice: o.totalPrice,
      createdAt: o.createdAt as string,
      itemsCount: o.itemsCount as number,
      tableNumber: o.tableNumber as number,
    }));

  const metrics = {
    ordersToday: 0,
    inProgress: 0,
    completed: 0,
    revenueToday: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold text-black mb-2">Dashboard Admin</h2>
        <p className="text-sm text-zinc-700">Overview aktivitas hari ini</p>
      </div>

      {/* Metrics ringkas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-regular">
        <div className="rounded-2xl border drop-shadow-xs bg-white px-6 py-10">
          <div className="flex items-start justify-between">
            <div className="rounded-xl p-3 bg-amber-50 mb-4">
              <ShoppingCart className=" text-amber-600 " />
            </div>
          </div>
          <p className="text-md text-black">Pesanan Hari Ini</p>
          <p className="text-3xl font-semibold text-black">
            {metrics.ordersToday}
          </p>
        </div>
        <div className="rounded-2xl border drop-shadow-xs bg-white px-6 py-10">
          <div className="flex items-start justify-between">
            <div className="rounded-xl p-3 bg-red-50 mb-4">
              <ListChecks className=" text-red-600 " />
            </div>
          </div>
          <p className="text-md text-black">Sedang Diproses</p>
          <p className="mt-2 text-3xl font-semibold text-black">
            {metrics.inProgress}
          </p>
        </div>
        <div className="rounded-2xl border drop-shadow-xs bg-white px-6 py-10">
          <div className="flex items-start justify-between">
            <div className="rounded-xl p-3 bg-blue-50 mb-4">
              <TrendingUp className=" text-blue-600 " />
            </div>
          </div>
          <p className="text-md text-black">Selesai</p>
          <p className="mt-2 text-3xl font-semibold text-black">
            {metrics.completed}
          </p>
        </div>
        <div className="rounded-2xl border drop-shadow-xs bg-white px-6 py-10">
          <div className="flex items-start justify-between">
            <div className="rounded-xl p-3 bg-emerald-50 mb-4">
              <TrendingUp className=" text-emerald-600 " />
            </div>
          </div>
          <p className="text-md text-black">Pendapatan Hari Ini</p>
          <p className="mt-2 text-3xl font-semibold text-black">{`Rp ${Intl.NumberFormat(
            "id-ID"
          ).format(metrics.revenueToday)}`}</p>
        </div>
      </div>

      {/* Tabel pesanan terakhir */}
      <OrdersCard order={rows}/>
    </div>
  );
}
