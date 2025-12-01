// src/lib/auth/options.ts
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { compare } from 'bcryptjs';
import prisma from '@/infrastructure/prisma/PrismaClient';
import { isAdminRole } from './rbac';

const credentialsSchema = z.object({
    email: z.string().email().transform(v => v.toLowerCase().trim()),
    password: z.string().min(6).max(200),
});

// dummy hash untuk samarkan timing saat user tak ditemukan
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8vQK1p8H2c5wK0v5m1k6e1m1m1m1mW';

export const authOptions: NextAuthOptions = {
    pages: { signIn: '/admin/login', error: '/admin/login' },
    session: { 
        strategy: 'jwt', 
        maxAge: 60 * 60 * 6, 
        updateAge: 60 * 60 * 2 
    },
    secret: process.env.NEXTAUTH_SECRET,

    providers: [
        Credentials({
            name: 'Credentials',
            credentials: { email: {}, password: {} },
            async authorize(raw) {
                // (opsional) await limiter.check('login:'+ip, 5, '1m');

                const parsed = credentialsSchema.safeParse(raw);
                if (!parsed.success) return null;
                const { email, password } = parsed.data;

                const user = await prisma.user.findUnique({
                    where: { email },
                    select: { id: true, name: true, email: true, password: true, role: true, tokenVersion: true },
                });

                if (!user?.password) {
                    await compare(password, DUMMY_HASH);
                    return null;
                }

                const ok = await compare(password, user.password);
                if (!ok || !isAdminRole(user.role)) return null;

                return { id: user.id, name: user.name ?? undefined, email: user.email, role: user.role };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            // saat login: sinkronkan claim
            if (user?.email) {
                const u = await prisma.user.findUnique({
                    where: { email: user.email },
                    select: { id: true, role: true, tokenVersion: true },
                });
                if (u) {
                    (token as any).role = u.role;
                    (token as any).tv = u.tokenVersion;
                    token.sub = u.id;
                }
                return token;
            }
            // pada refresh: validasi tokenVersion masih cocok
            if (token.sub) {
                const u = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: { role: true, tokenVersion: true },
                });
                if (!u || u.tokenVersion !== (token as any).tv) {
                    (token as any).invalid = true;
                } else {
                    (token as any).role = u.role;
                }
            }
            return token;
        },

        async session({ session, token }) {
            if ((token as any).invalid) return null as any;
            session.user = {
                ...(session.user ?? {}),
                id: token.sub as string,
                email: token.email as string | undefined,
                role: (token as any).role as string,
            } as any;
            return session;
        },
    },
};
