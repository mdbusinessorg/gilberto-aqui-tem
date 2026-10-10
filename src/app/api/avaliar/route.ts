import { NextResponse } from 'next/server'
import { createClient, getSessionProfile } from '@/lib/supabase/server'
import { isAdminRole } from '@/lib/labels'
import { addStoreReview, setStoreReviewStatus } from '@/lib/metrics'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

type Body = {
  order_number?: string
  phone?: string
  product_id?: string
  rating?: number
  comment?: string
  photo?: string | null
}

const PHOTO_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null
  const rating = Math.round(Number(body?.rating))
  const comment = (body?.comment ?? '').trim().slice(0, 1000)
  if (!body?.order_number || !body.phone || !body.product_id || !(rating >= 1 && rating <= 5) || comment.length < 3)
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  if (body.photo && (!PHOTO_RE.test(body.photo) || body.photo.length > 1_400_000))
    return NextResponse.json({ error: 'Foto inválida ou demasiado grande' }, { status: 400 })

  const supabase = createClient()
  const { data: order } = await supabase.rpc('lookup_order', { p_number: body.order_number, p_phone: body.phone })
  if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  const o = order as { customer_name?: string; items?: { name?: string }[] }

  const { data: product } = await supabase.from('products').select('id,name').eq('id', body.product_id).maybeSingle()
  if (!product) return NextResponse.json({ error: 'Produto inválido' }, { status: 400 })
  const bought = (o.items ?? []).some((i) => (i.name ?? '').toLowerCase() === (product.name ?? '').toLowerCase())
  if (!bought) return NextResponse.json({ error: 'Este produto não está neste pedido' }, { status: 403 })

  await addStoreReview({
    id: randomUUID(),
    product_id: product.id!,
    product_name: product.name ?? '',
    author_name: o.customer_name ?? 'Cliente',
    rating,
    comment,
    photo: body.photo ?? null,
    status: 'pendente',
    order_number: body.order_number,
    created_at: new Date().toISOString(),
  })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const { user, profile } = await getSessionProfile()
  if (!user || !profile || !isAdminRole(profile.role))
    return NextResponse.json({ error: 'Apenas administradores' }, { status: 403 })
  const body = (await req.json().catch(() => null)) as { id?: string; status?: string } | null
  if (!body?.id || !['aprovada', 'rejeitada', 'oculta'].includes(body.status ?? ''))
    return NextResponse.json({ error: 'Inválido' }, { status: 400 })
  const ok = await setStoreReviewStatus(body.id, body.status as 'aprovada' | 'rejeitada' | 'oculta')
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Não encontrada' }, { status: 404 })
}
