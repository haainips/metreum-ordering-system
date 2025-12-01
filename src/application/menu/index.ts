import { PrismaMenuRepository } from '../../infrastructure/prisma/PrismaMenuRepository';
import { CreateMenuUC } from './usecases/CreateMenu';
import { UpdateMenuUC } from './usecases/UpdateMenu';
import { DeleteMenuUC } from './usecases/DeleteMenu';

export function menuUseCasesFactory() {
  const repo = new PrismaMenuRepository();
  return {
    createMenu: new CreateMenuUC(repo),
    updateMenu: new UpdateMenuUC(repo),
    deleteMenu: new DeleteMenuUC(repo),
  };
}
