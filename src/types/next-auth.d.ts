// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from 'next-auth';

type Role = 'ADMIN' | 'SUPERADMIN';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
    } & DefaultSession['user'];
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    role?: Role;
    tv?: number;
    invalid?: boolean;
  }
}
