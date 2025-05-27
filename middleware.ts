export { default } from "next-auth/middleware"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // If user is not authenticated and tries to access a protected route (e.g., /admin)
  if (!token && pathname.startsWith('/admin')) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/signin'; // Redirect to sign-in
    url.searchParams.set('callbackUrl', pathname); // Pass original path as callbackUrl
    return NextResponse.redirect(url);
  }

  // If user is authenticated
  if (token) {
    // If user tries to access admin routes but is not an ADMIN
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      const url = req.nextUrl.clone();
      url.pathname = '/'; // Or an 'unauthorized' page
      return NextResponse.redirect(url); 
    }
  }

  return NextResponse.next();
}

// Specify which paths the middleware should apply to
export const config = {
  matcher: [
    '/admin/:path*', // Protect all routes under /admin
    // Add other paths you want to protect that require authentication but not necessarily admin role
    // '/dashboard/:path*',
  ],
}