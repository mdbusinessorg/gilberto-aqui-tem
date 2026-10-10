import { NextResponse } from 'next/server'
import { getSessionProfile } from '@/lib/supabase/server'
import { isAdminRole } from '@/lib/labels'
import { bumpMetric, getMetrics } from '@/lib/metrics'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f-]{36}$/i

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { product_id?: string; type?: string }
    if (!body.product_id || !UUID_RE.test(body.product_id) || (body.type !== 'views' && body.type !== 'favs'))
      return NextResponse.json({ error: 'Inválido' }, { status: 400 })
    await bumpMetric(body.product_id, body.type)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Inválido' }, { status: 400 })
  }
}

export async function GET() {
  const { user, profile } = await getSessionProfile()
  if (!user || !profile || !isAdminRole(profile.role))
    return NextResponse.json({ error: 'Apenas administradores' }, { status: 403 })
  return NextResponse.json(await getMetrics())
}
