import { Menu } from './Menu';

export interface IMenuRepository {
  create(menu: Menu): Promise<Menu>;
  update(menu: Menu): Promise<Menu>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Menu | null>;
  list(params?: { q?: string; take?: number; skip?: number; categoryId?: number }): Promise<Menu[]>;
}
