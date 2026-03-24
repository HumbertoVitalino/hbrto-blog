import { createServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Don't apply middleware to login page or static assets
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if the route requires authentication
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    try {
      const supabase = await createServerClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (error) {
      // If Supabase is not configured, allow access to login page
      // but redirect to it for authentication
      if (pathname !== '/admin/login') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
