import { IMenuRepository } from '@/domain/menu/IMenuRepository';
import { Menu } from '@/domain/menu/Menu';
import prisma from './PrismaClient';
import { MenuMapper } from './mappers/MenuMapper';

export class PrismaMenuRepository implements IMenuRepository {
  async create(menu: Menu): Promise<Menu> {
    const data = MenuMapper.toPersistence(menu);
    const row = await prisma.menu.create({ data, include: { Category: true } });
    return MenuMapper.toDomain(row);
  }
  async update(menu: Menu): Promise<Menu> {
    const v = menu.value;
    const data = MenuMapper.toPersistence(menu);
    const row = await prisma.menu.update({ where: { id: v.id! }, data, include: { Category: true } });
    return MenuMapper.toDomain(row);
  }
  async delete(id: number): Promise<void> {
    await prisma.menu.delete({ where: { id } });
  }
  async findById(id: number): Promise<Menu | null> {
    const row = await prisma.menu.findUnique({ where: { id }, include: { Category: true } });
    return row ? MenuMapper.toDomain(row) : null;
  }
  async list(p?: { q?: string; take?: number; skip?: number; categoryId?: number }): Promise<Menu[]> {
    const rows = await prisma.menu.findMany({
      where: {
        AND: [
          p?.q ? { name: { contains: p.q, mode: 'insensitive' } } : {},
          p?.categoryId ? { categoryId: p.categoryId } : {},
        ],
      },
      take: p?.take ?? 50,
      skip: p?.skip ?? 0,
      orderBy: { id: 'desc' },
      include: { Category: true },
    });
    return rows.map(MenuMapper.toDomain);
  }
}
