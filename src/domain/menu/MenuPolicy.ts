export type Role = 'ADMIN' | 'SUPERADMIN';

export const MenuPolicy = {
  canCreate(role: Role) {
    return role === 'ADMIN' || role === 'SUPERADMIN';
  },
  canDelete(role: Role) {
    return role === 'ADMIN' || role === 'SUPERADMIN';
  },
};
