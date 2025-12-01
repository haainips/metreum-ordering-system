"use client"

import { Search, Filter } from "lucide-react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "../_shared/button"

const filters = [
    { key: "", label: "Semua Pesanan" },
    { key: "PENDING", label: "Pending" },
    { key: "PROCESS", label: "Diproses" },
    { key: "COMPLETED", label: "Selesai" },
    { key: "CANCELLED", label: "Dibatalkan" },
  ] as const

export default function OrdersFilter() {

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const status = sp.get("status") ?? "";

  function setStatus(s: string) {
    const p = new URLSearchParams(sp.toString());
    s ? p.set("status", s) : p.delete("status");
    p.delete("cursor");
    router.replace(`${pathname}?${p.toString()}`);
  }

  function reset() {
    const p = new URLSearchParams(sp.toString());
    p.delete("q");
    p.delete("status");
    p.delete("cursor");
    router.replace(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari pesanan atau meja..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 outline-none transition-all"
          />
        </div>
        <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      </div> */}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <Button key={filter.key || "ALL"} variant={status === filter.key ? "default" : "secondary"} className="h-8" onClick={() => setStatus(filter.key)}>
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
