import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && (path.startsWith('/admin') || path.startsWith('/conta'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/entrar'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }
  if (user && path.startsWith('/admin')) {
    const { data: profile } = await supabase.from('profiles').select('role, is_active').eq('id', user.id).single()
    if (!profile || profile.role === 'customer' || !profile.is_active) {
      const url = request.nextUrl.clone()
      url.pathname = '/conta'
      url.searchParams.set('erro', 'sem-acesso')
      return NextResponse.redirect(url)
    }
  }
  if (user && (path === '/entrar' || path === '/registar')) {
    const url = request.nextUrl.clone()
    url.pathname = request.nextUrl.searchParams.get('next') || '/conta'
    url.search = ''
    return NextResponse.redirect(url)
  }
  return response
}
