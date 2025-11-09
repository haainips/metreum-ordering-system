// app/api/admin/ping/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  return new Response(JSON.stringify({ ok: true, user: session.user }), { status: 200 });
}
