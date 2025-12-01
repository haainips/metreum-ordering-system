import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;

    // 1) Guard customer flow: butuh cookie konteks meja
    if (pathname.startsWith('/menu') || pathname.startsWith('/cart') || pathname.startsWith('/checkout')) {
      const hasCtx = req.cookies.get('table_ctx')?.value;
      if (!hasCtx) {
        const url = req.nextUrl.clone();
        url.pathname = '/scan-required'; // halaman info "harap scan QR meja"
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }
    return NextResponse.next();
  },

  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        if (path === '/admin/login') return true;

        if (path.startsWith('/admin')) {
          if (!token) return false;
          
          const role = (token as any).role;
          if (role === 'ADMIN' || role === 'SUPERADMIN') return true;

          return false;
        }

        if (path.startsWith('/menu') || path.startsWith('/cart') || path.startsWith('/checkout')) {
          return true;
        }
        
        return true;
      },
    },
  }
);

export const config = { matcher: ['/admin/:path*', '/menu/:path*', '/cart/:path*', '/checkout/:path*'] };
