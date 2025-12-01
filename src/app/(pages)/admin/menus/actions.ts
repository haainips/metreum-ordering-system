'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import prisma from '@/infrastructure/prisma/PrismaClient';
import { menuUseCasesFactory } from '@/application/menu';

const Upsert = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  price: z.coerce.number().nonnegative(),
  available: z.coerce.boolean().optional().default(true),
  imageUrl: z.string().url().optional(),
  categoryId: z.coerce.number().int().positive(),
});

export async function createMenu(input: unknown) {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'UNAUTHENTICATED' } as const;

  const parsed = Upsert.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'INVALID' } as const;

  try {
    const { createMenu } = menuUseCasesFactory();
    const menu = await createMenu.exec(parsed.data, session.user.role as any);
    revalidatePath('/admin/menus');
    return { ok: true, menu } as const;
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'ERROR' } as const;
  }
}

export async function updateMenu(id: number, input: unknown) {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'UNAUTHENTICATED' } as const;

  const parsed = Upsert.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'INVALID' } as const;

  try {
    const { updateMenu } = menuUseCasesFactory();
    const menu = await updateMenu.exec(id, parsed.data);
    revalidatePath('/admin/menus');
    return { ok: true, menu } as const;
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'ERROR' } as const;
  }
}

export async function deleteMenu(id: number) {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'UNAUTHENTICATED' } as const;
  try {
    const { deleteMenu } = menuUseCasesFactory();
    await deleteMenu.exec(id, session.user.role as any);
    revalidatePath('/admin/menus');
    return { ok: true } as const;
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'ERROR' } as const;
  }
}

const CategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export async function createCategory(input: unknown) {
  const parsed = CategorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Nama kategori tidak valid" } as const;

  try {
    const category = await prisma.category.create({
      data: { name: parsed.data.name },
      select: { id: true, name: true },
    });
    revalidatePath("/admin/menus");
    return { ok: true, category } as const;
  } catch (e: any) {
    if (e?.code === "P2002") return { ok: false, error: "Nama kategori sudah ada" } as const;
    return { ok: false, error: "Gagal membuat kategori" } as const;
  }
}