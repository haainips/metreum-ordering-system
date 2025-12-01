// src/domain/orders/OrderPolicy.ts
export type Role = "ADMIN" | "SUPERADMIN";
export const OrderPolicy = {
  adminCanRead(role: Role) {
    return role === "ADMIN" || role === "SUPERADMIN";
  },
  publicCanRead() {
    return true; // tracking by code selalu boleh
  },
};
