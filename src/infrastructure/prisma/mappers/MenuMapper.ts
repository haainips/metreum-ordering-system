import { Menu } from '@/domain/menu/Menu';

export const MenuMapper = {
  toDomain(row: any): Menu {
    return Menu.restore({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      available: row.available,
      imageUrl: row.imageUrl,
      categoryId: row.categoryId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },
  toPersistence(entity: Menu) {
    const value = entity.value;
    return {
      id: value.id,
      name: value.name,
      description: value.description,
      price: value.price,
      availableMemory: value.available,
      imageUrl: value.imageUrl ?? null,
      categoryId: value.categoryId,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    };
  },
};
