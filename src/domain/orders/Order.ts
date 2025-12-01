export type OrderStatus = "PENDING" | "PROCESS" | "COMPLETED" | "CANCELLED";
export type TableInfo = {id:string, number:number};

export type OrderProps = {
  id: number;
  orderCode: string;
  customerName: string;
  tableId: string;
  note: string | null;
  status: OrderStatus;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
  OrderItems?: Array<{
    id: number;
    menuId: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  table?: TableInfo;
};

export class Order {
  private constructor(private props: OrderProps) {}
  static restore(p: OrderProps) {
    return new Order(p);
  } // dari persistence
  get value(): OrderProps {
    return { ...this.props };
  }

  // aturan domain mutasi status (dipakai di use case update status)
  moveTo(next: OrderStatus) {
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["PROCESS", "CANCELLED"],
      PROCESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (!allowed[this.props.status].includes(next))
      throw new Error("STATUS_FLOW_INVALID");
    this.props.status = next;
  }
}
