import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do not remove, required to keep session alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/data') ||
    pathname.startsWith('/alerts') ||
    pathname.startsWith('/chat')

  // Only redirect to login if trying to access a protected route without a session
  if (!user && isDashboardRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect away from /login only (not /signup — that's needed for org creation after sign up)
  if (user && pathname === '/login') {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
