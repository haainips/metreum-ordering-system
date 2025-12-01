// app/admin/menus/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/infrastructure/prisma/PrismaClient";
import MenusPageClient from "@/ui/menu/MenusPageClient";
import {
  createMenu,
  updateMenu,
  deleteMenu,
  createCategory,
} from "./actions";

const menuActions = {
  createMenu,
  updateMenu,
  deleteMenu,
  createCategory,
} satisfies import("@/ui/menu/MenusPageClient").MenuActions;

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const [menus, categories] = await Promise.all([
    prisma.menu.findMany({
      select: {
        id: true, name: true, description: true, price: true,
        available: true, imageUrl: true, categoryId: true,
        Category: { select: { id: true, name: true } },
      },
      orderBy: { id: "desc" },
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <MenusPageClient
      initialMenus={menus}
      initialCategories={categories}
      actions={menuActions}
      role={session.user.role as "ADMIN" | "SUPERADMIN"}
    />
  );
}
