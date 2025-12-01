import { IMenuRepository } from '@/domain/menu/IMenuRepository';
import { UpdateMenuDTO } from '../dto/MenuDTO';

export class UpdateMenuUC {
  constructor(private repo: IMenuRepository) {}
  async exec(id: number, dto: UpdateMenuDTO) {
    const menu = await this.repo.findById(id);
    if (!menu) throw new Error("NOT_FOUND");
    menu.rename(dto.name);
    menu.setPrice(dto.price);
    menu.setAvailable(dto.available);
    menu.setImage(dto.imageUrl);
    (menu as any).value.categoryId = dto.categoryId;
    const upd = await this.repo.update(menu);
    return upd.value;
  }
}
