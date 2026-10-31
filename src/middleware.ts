import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'gfs-erp-prodcore-2026-secret-key-do-not-expose',
});

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 경로에 인증을 적용:
     * - /login (로그인 페이지)
     * - /api/auth (NextAuth 인증 API)
     * - /_next (Next.js 정적 리소스)
     * - /favicon.ico, /icon, /images 등 정적 파일
     */
    '/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|icon|images|pic|logo).*)',
  ],
};

