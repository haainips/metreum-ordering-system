import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import NextAuthSessionProvider from "@/app/providers/session-provider";
import AdminShell from "@/ui/admin/AdminShell";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return (
    <NextAuthSessionProvider session={session}>
      <AdminShell user={{ name: session.user.name,role: session.user.role, email: session.user.email }}>
        {children}
      </AdminShell>
    </NextAuthSessionProvider>
  );
}
