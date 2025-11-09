export const ROLES = ['ADMIN', 'SUPERADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const ALLOWED_ADMIN = new Set<Role>(['ADMIN', 'SUPERADMIN']);
export function isAdminRole(role?: string): role is Role {
  return role === 'ADMIN' || role === 'SUPERADMIN';
}
