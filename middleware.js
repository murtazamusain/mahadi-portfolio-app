import { NextResponse } from 'next/server';

export function middleware(request) {
  // শুধু /invoice পেজ প্রোটেক্ট করুন
  if (request.nextUrl.pathname.startsWith('/invoice')) {
    const authCookie = request.cookies.get('invoice_auth');
    const isAuthenticated = authCookie?.value === 'true';

    console.log('Auth Cookie:', authCookie); // ডিবাগিং এর জন্য

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/invoice/:path*'],
};
