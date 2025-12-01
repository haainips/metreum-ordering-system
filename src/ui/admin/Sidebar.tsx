"use client";

// components/admin/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  MapPin,
  FileText,
  Users,
  UtensilsCrossed,
  FolderOpen,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

type NavItemProps = {
  href: string;
  label: string;
  active?: boolean;
  Icon?: LucideIcon;
};

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    SUPERADMIN: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
    ADMIN: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold ${
        map[role] ?? "bg-zinc-700/40 text-zinc-200 ring-1 ring-zinc-500/30"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {role}
    </span>
  );
}

function NavItem({ href, label, active, Icon }: NavItemProps) {
  const base =
    "flex items-center gap-4 rounded-2xl px-3 py-2 text-[15px] transition";
  const activeStyle = "bg-white text-emerald-950 shadow-sm";
  const inactiveStyle =
    "text-slate-200/80 hover:bg-white/10 hover:text-gray-200/80";

  return (
    <Link
      href={href}
      className={`${base} ${active ? activeStyle : inactiveStyle}`}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{label}</span>
    </Link>
  );
}

export default function AdminSidebar({
  name,
  email,
  role,
}: {
  name?: string | null;
  email: string;
  role: string;
}) {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuActive =
    pathname?.startsWith("/admin/menus") ||
    pathname?.startsWith("/admin/categories");

  useEffect(() => {
    if (menuActive) {
      setMenuOpen(true);
    }
  }, [menuActive]);

  return (
    <aside className="w-64 shrink-0 rounded-3xl bg-emerald-950 px-4 py-6 shadow-sm backdrop-blur flex flex-col">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-emerald-950">
          M
        </div>
        <div>
          <p className="text-lg font-extrabold tracking-tight text-white">
            Metreum
          </p>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-4">
        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Menu
          </p>
          <div className="space-y-2">
            <NavItem
              href="/admin"
              label="Dashboard"
              active={pathname === "/admin"}
              Icon={Home}
            />
            <NavItem
              href="/admin/orders"
              label="Pesanan"
              active={pathname?.startsWith("/admin/orders")}
              Icon={ShoppingCart}
            />
            <NavItem
              href="/admin/menus"
              label="Kelola Menu"
              active={pathname?.startsWith("/admin/menus")}
              Icon={UtensilsCrossed}
            />
            <NavItem
              href="/admin/categories"
              label="Kelola Kategori"
              active={pathname?.startsWith("/admin/categories")}
              Icon={FolderOpen}
            />
          </div>
        </div>

        {/* Administrasi */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Administrasi
          </p>
          <div className="space-y-1">
            <NavItem
              href="/admin/reports"
              label="Laporan"
              active={pathname?.startsWith("/admin/reports")}
              Icon={FileText}
            />
            <NavItem
              href="/admin/tables"
              label="Meja &amp; QR"
              active={pathname?.startsWith("/admin/tables")}
              Icon={MapPin}
            />
            <NavItem
              href="/admin/users"
              label="Pengguna"
              active={pathname?.startsWith("/admin/users")}
              Icon={Users}
            />
          </div>
        </div>
      </nav>
      <div className="space-y-4 border-t border-white/10 pt-4 mt-4">
        <div className="flex items-center gap-2 bg-green-100/5 px-3 py-2 rounded-xl drop-shadow-xl">
          <div className="px-2.5 py-1 rounded-4xl bg-green-400 drop-shadow-md">
            <p className="text-white font-extrabold">{role === "SUPERADMIN" ? "S": "A" }</p>
          </div>
          <div>
            <p className="text-slate-100 text-sm font-bold">{role}</p>
            <p className="text-xs font-semibold text-slate-400">{email}</p>
          </div>
        </div>
        <div className="flex gap-3 text-slate-200/80 px-4 py-2 rounded-xl hover:bg-slate-50/10 hover:text-white transition">
          <LogOut className="h-6 w-6" />
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full text-left text-sm "
          >
            Keluar
          </button>
        </div>
      </div>
    </aside>
  );
}
