"use client";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/_shared/card";
import { MapPin, User, Clock4, ChevronRight } from "lucide-react";
import { OrderListItemDTO } from "@/application/order/contracts";
import { formatTimeAgo } from "@/lib/date";

export type OrderStatus = "PENDING" | "PROCESS" | "COMPLETED" | "CANCELLED";

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 border border-amber-200",
  PROCESS: "bg-blue-100 text-blue-700 border border-blue-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-red-100 text-red-700 border border-red-200",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={
        "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full " +
        ORDER_STATUS_STYLES[status]
      }
    >
      {status}
    </span>
  );
}

export default function RecentOrdersCard({
  initialOrders,
}: {
  initialOrders: OrderListItemDTO[];
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {initialOrders.length === 0 ? (
        <p className="h-20 w-full col-span-4 mt-20 text-center text-muted-foreground">
          Belum ada pesanan
        </p>
      ) : (
        initialOrders.map((o) => (
          <Card key={o.id} className="w-full hover:border-emerald-200 hover:drop-shadow-lg transition">
            <CardHeader className="border-b px-4">
              <CardTitle className="text-sm space-y-2 mb-0">
                <div className="flex justify-between">
                  <div className="">
                    <p className="text-sm text-gray-500 font-medium">
                      Pesanan #{String(o.id).padStart(3, "0")}
                    </p>
                    <p className="text-xl font-bold">
                      Rp {o.totalPrice.toLocaleString("id-ID")}{" "}
                    </p>
                  </div>
                  <div className="px-2 rounded-xl font-medium">
                    <StatusBadge status={o.status as OrderStatus} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 font-normal">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Meja {o.tableNumber}
                </div>
                <div className="flex items-center gap-2 text-gray-500 font-normal">
                  <User className="w-4 h-4 text-emerald-600" />
                  {o.customerName}
                </div>
                <div className="flex items-center gap-2 text-gray-500 font-normal">
                  <Clock4 className="w-4 h-4 text-emerald-600" />
                  <span>{formatTimeAgo(o.createdAt)}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-sm text-gray-500">{o.itemsCount} item pesanan</p>
              <div className="p-1 rounded-lg hover:bg-emerald-50 transtition">
                <ChevronRight className="text-emerald-500 w-5 h-5"/>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
