import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // '/:id' only matches one segment, so the nested style-guide pages need
  // their own entry or they would be served without a session.
  matcher: [
    '/',
    '/:id',
    '/spinners/:path*',
    '/api/:path*',
    '/login',
    '/register',
  ],
};
