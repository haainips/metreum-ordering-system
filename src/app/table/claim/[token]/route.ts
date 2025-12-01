// app/t/[token]/route.ts
import { NextResponse } from 'next/server';
import { verifyTableToken } from '@/lib/table-token';

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const url = new URL(req.url);
  const payload = verifyTableToken(params.token);

  if (!payload) {
    return NextResponse.redirect(new URL('/scan-error', url));
  }

  const res = NextResponse.redirect(new URL('/menu', url));
  res.cookies.set('table_ctx', JSON.stringify({ tableId: payload.tableId }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 6, // 6 jam
  });

  return res;
}
