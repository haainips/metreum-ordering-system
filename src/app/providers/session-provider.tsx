// src/app/providers/session-provider.tsx
"use client";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

export default function NextAuthSessionProvider({ children, session }: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}
