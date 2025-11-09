import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) return false;
        const path = req.nextUrl.pathname;
        if (path.startsWith('/admin')) {
          const role = (token as any).role;
          return role === 'ADMIN' || role === 'SUPERADMIN';
        }
        return true;
      },
    },
  }
);

export const config = { matcher: ['/admin/:path*'] };
