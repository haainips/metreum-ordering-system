export type MenuProps = {
  id?: number;
  name: string;
  description: string;
  price: number;   // Float
  available: boolean;   // Int
  imageUrl?: string | null;
  categoryId: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Menu {
  private constructor(private props: MenuProps) {}

  static create(props: Omit<MenuProps, 'id'|'createdAt'|'updatedAt'>) {
    // Rule dasar domain
    if (!props.name?.trim()) throw new Error('NAME_REQUIRED');
    if (props.price < 0) throw new Error('PRICE_INVALID');
    return new Menu(props);
  }

  static restore(props: MenuProps) {
    return new Menu(props); // dari persistence
  }

  get value(): MenuProps {
    return { ...this.props };
  }

  rename(name: string) {
    if (!name?.trim()) throw new Error('NAME_REQUIRED');
    this.props.name = name.trim();
  }

  setPrice(price: number) {
    if (price < 0) throw new Error('PRICE_INVALID');
    this.props.price = price;
  }

  setAvailable(available: boolean) {
    this.props.available = available;
  }

  setImage(url?: string | null) {
    this.props.imageUrl = url ?? null;
  }
}
