"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/ui/_shared/card";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { OrderListItemDTO } from "@/application/order/contracts";

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTime(iso: string) {
  const d = new Date(iso);
  return timeFormatter.format(d);
}

export default function OrdersCard({ order }: { order: OrderListItemDTO[] }) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Pesanan Terbaru</CardTitle>
          <Link
            href={"admin/orders"}
            className="text-sm font-medium text-primary hover:underline"
          >
            Lihat Semua
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {(order?.length ?? 0) === 0 ? (
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {order?.map((data) => (
              <div
                key={data.id}
                className="flex items-center justify-between p-5 border border-border/50 rounded-xl hover:bg-emerald-100/20 hover:border-border transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-200/30 flex items-center justify-center group-hover:bg-emerald-200/60 transition-colors">
                    <ShoppingCart
                      className="w-6 h-6 text-emerald-900"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-foreground text-base">
                        #{data.orderCode}
                      </p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-sm font-medium text-muted-foreground">{data.itemsCount} Items</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Meja {data.tableNumber}</span>
                      <span>•</span>
                      <span>{formatTime(data.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground mb-1">Rp {data.totalPrice.toLocaleString("id-ID")}</p>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
                      <span className="text-xs font-semibold">{data.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
