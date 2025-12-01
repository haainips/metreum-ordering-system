import { IMenuRepository } from "@/domain/menu/IMenuRepository";
import { MenuPolicy, Role } from "@/domain/menu/MenuPolicy";

export class DeleteMenuUC {
  constructor(private repo: IMenuRepository) {}
  async exec(id: number, role: Role) {
    if (!MenuPolicy.canDelete(role)) throw new Error("FORBIDDEN");
    await this.repo.delete(id);
  }
}
