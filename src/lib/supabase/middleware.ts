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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isAuthPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/register')

  // List of public assets/APIs that should not be protected
  const isStaticAsset = 
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') || 
    url.pathname === '/favicon.ico'

  if (isStaticAsset) {
    return supabaseResponse
  }

  // Redirect to login if not logged in and not on auth page
  if (!user && !isAuthPage) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if logged in and on auth page
  if (user && isAuthPage) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
