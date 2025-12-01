"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Card } from "@/ui/_shared/card";
import { Input } from "@/ui/_shared/input";
import { Button } from "@/ui/_shared/button";
import { Badge } from "@/ui/_shared/badge";
import { MapPin, User2, Clock3, ChevronRight } from "lucide-react";

// Simpel: card-list dengan pencarian client-side (tanpa DataTable)
// Sesuaikan dengan DTO yang kamu kirim dari server
export type OrderCard = {
  id: number;
  orderCode: string;
  customerName?: string | null;
  tableId: string;
  tableNumber?: number | null;
  status: "PENDING" | "PROCESS" | "COMPLETED" | "CANCELLED";
  totalPrice: number;
  createdAt: string; // ISO string
  itemsCount?: number | null;
};

function rupiah(n: number) {
  return `Rp ${Intl.NumberFormat("id-ID").format(n)}`;
}

function relTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec} detik yang lalu`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit yang lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam yang lalu`;
  const day = Math.floor(hr / 24);
  return `${day} hari yang lalu`;
}

function StatusPill({ s }: { s: OrderCard["status"] }) {
  switch (s) {
    case "COMPLETED":
      return <Badge className="bg-emerald-600 hover:bg-emerald-600">COMPLETED</Badge>;
    case "PROCESS":
      return <Badge className="bg-blue-600 hover:bg-blue-600">PROCESS</Badge>;
    case "PENDING":
      return <Badge variant="secondary">PENDING</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">CANCELLED</Badge>;
  }
}

export default function OrdersCardsClient({ initialOrders }: { initialOrders: OrderCard[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return initialOrders;
    return initialOrders.filter((o) => {
      const inCode = o.orderCode.toLowerCase().includes(needle);
      const inCust = (o.customerName ?? "").toLowerCase().includes(needle);
      const inTblN = String(o.tableNumber ?? "").toLowerCase().includes(needle);
      const inTblI = String(o.tableId).toLowerCase().includes(needle);
      return inCode || inCust || inTblN || inTblI;
    });
  }, [initialOrders, q]);

  return (
    <div className="space-y-4">
      {/* Search bar seperti mockup-mu */}
      <div className="flex items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari pesanan atau meja…"
          className="w-full max-w-md"
        />
        {/* Tombol filter opsional */}
        <Button variant="outline" className="hidden sm:inline-flex" disabled>
          Filter
        </Button>
      </div>

      {/* Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((o) => (
          <Card key={o.id} className="rounded-2xl border-border/50 shadow-sm">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Pesanan #{o.orderCode}</p>
                  <p className="text-2xl font-bold">{rupiah(o.totalPrice)}</p>
                </div>
                <StatusPill s={o.status} />
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={16} />
                  <span>Meja {o.tableNumber ?? o.tableId}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User2 size={16} />
                  <span>{o.customerName ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock3 size={16} />
                  <span>{relTime(o.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/50 p-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{(o.itemsCount ?? 0) > 1 ? `${o.itemsCount} item pesanan` : `${o.itemsCount ?? 0} item pesanan`}</span>
              <ChevronRight size={18} className="text-emerald-600" />
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-10">Tidak ada pesanan yang cocok</div>
      )}
    </div>
  );
}
