export type CreateMenuDTO = {
  name: string;
  description: string;
  price: number;
  available: boolean;
  imageUrl?: string;
  categoryId: number;
};
export type UpdateMenuDTO = CreateMenuDTO;
