import { IMenuRepository } from '@/domain/menu/IMenuRepository';
import { MenuPolicy, Role } from '@/domain/menu/MenuPolicy';
import { CreateMenuDTO } from '../dto/MenuDTO';
import { Menu } from '@/domain/menu/Menu';

export class CreateMenuUC {
  constructor(private repo: IMenuRepository) {}
  async exec(dto: CreateMenuDTO, role: Role) {
    if (!MenuPolicy.canCreate(role)) throw new Error("FORBIDDEN");
    const menu = Menu.create(dto);
    const saved = await this.repo.create(menu);
    return saved.value;
  }
}
