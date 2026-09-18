'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button, Modal, Field, Input, Select, Textarea, Checkbox } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'
import { PhotoUpload } from '@/components/ui/photo-upload'

type Cat = { id: string; name: string }
type Product = Database['public']['Tables']['products']['Row']
type ProductImage = Database['public']['Tables']['product_images']['Row']

export function ProductForm({ categories, brands, product, images = [] }: { categories: Cat[]; brands: Cat[]; product?: Product; images?: ProductImage[] }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [photos, setPhotos] = React.useState(images.map((image) => image.url))
  const savedId = React.useRef(product?.id)
  const imageIds = React.useRef(new Map(images.map((image) => [image.url, image.id])))
  const toast = useToast()
  const router = useRouter()
  const initialForm = {
    name: product?.name ?? '', sku: product?.sku ?? '', price: product?.price?.toString() ?? '',
    promo_price: product?.promo_price?.toString() ?? '', cost_price: product?.cost_price?.toString() ?? '',
    category_id: product?.category_id ?? '', brand_id: product?.brand_id ?? '',
    condition: product?.condition ?? 'novo', min_stock: product?.min_stock?.toString() ?? '1',
    color: product?.color ?? '', storage: product?.storage ?? '', ram: product?.ram ?? '',
    battery: product?.battery_health?.toString() ?? '', warranty: product?.warranty_months?.toString() ?? '',
    model: product?.model ?? '', description: product?.description ?? '',
    featured: product?.is_featured ?? false, promo: product?.is_promo ?? false, active: product?.is_active ?? true,
    image_url: '',
  }
  const [f, setF] = React.useState(initialForm)
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || uploading) return
    if (!f.name.trim() || !f.price) { toast.error('Nome e preço são obrigatórios'); return }
    const urls = Array.from(new Set([...photos, ...(f.image_url.trim() ? [f.image_url.trim()] : [])]))
    if (urls.length > 6) { toast.error('Podes adicionar até 6 fotografias'); return }
    setLoading(true)
    const supabase = createClient()
    const sku = f.sku.trim() || `GAT-${Date.now().toString(36).toUpperCase()}`
    const row = {
      name: f.name.trim(), slug: product?.slug ?? `${slugify(f.name)}-${sku.toLowerCase()}`, sku,
      price: Number(f.price), promo_price: f.promo_price ? Number(f.promo_price) : null,
      cost_price: f.cost_price ? Number(f.cost_price) : null,
      category_id: f.category_id || null, brand_id: f.brand_id || null,
      condition: f.condition, min_stock: Number(f.min_stock || 1),
      color: f.color || null, storage: f.storage || null, ram: f.ram || null,
      battery_health: f.battery ? Number(f.battery) : null, warranty_months: f.warranty ? Number(f.warranty) : null,
      model: f.model || null, description: f.description || null,
      is_featured: f.featured, is_promo: f.promo, is_active: f.active,
    }
    try {
      const { data, error } = savedId.current
        ? await supabase.from('products').update(row as never).eq('id', savedId.current).select('id').single()
        : await supabase.from('products').insert(row as never).select('id').single()
      if (error) throw error
      savedId.current = data.id
      if (urls.length) {
        const rows = urls.map((url, index) => {
          const id = imageIds.current.get(url) ?? crypto.randomUUID()
          imageIds.current.set(url, id)
          return { id, product_id: data.id, url, alt: f.name.trim(), is_primary: index === 0, sort_order: index }
        })
        const { error: imageError } = await supabase.from('product_images').upsert(rows).select('id')
        if (imageError) throw imageError
      }
      const removed = Array.from(imageIds.current).filter(([url]) => !urls.includes(url))
      if (removed.length) {
        const { data: deleted, error: deleteError } = await supabase.from('product_images').delete()
          .eq('product_id', data.id).in('id', removed.map(([, id]) => id)).select('id')
        if (deleteError) throw deleteError
        if (deleted.length !== removed.length) throw new Error('Sem permissão para remover fotografias.')
        removed.forEach(([url]) => imageIds.current.delete(url))
      }
      toast.success(product ? 'Produto actualizado' : 'Produto criado')
      setPhotos(product ? urls : [])
      setF(product ? { ...f, image_url: '' } : initialForm)
      if (!product) { savedId.current = undefined; imageIds.current.clear() }
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Não foi possível guardar tudo', error instanceof Error ? error.message : 'Tenta guardar novamente. O produto não será duplicado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {product
        ? <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Editar</Button>
        : <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo produto</Button>}
      <Modal open={open} onClose={() => { if (!loading && !uploading) setOpen(false) }} title={product ? `Editar ${product.name}` : 'Novo produto'} size="lg">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" required className="sm:col-span-2"><Input value={f.name} onChange={(e) => set('name', e.target.value)} required /></Field>
          <Field label="SKU"><Input value={f.sku} onChange={(e) => set('sku', e.target.value)} placeholder="Auto se vazio" /></Field>
          <Field label="Modelo"><Input value={f.model} onChange={(e) => set('model', e.target.value)} /></Field>
          <Field label="Preço (Kz)" required><Input type="number" min={0} value={f.price} onChange={(e) => set('price', e.target.value)} required /></Field>
          <Field label="Preço promo (Kz)"><Input type="number" min={0} value={f.promo_price} onChange={(e) => set('promo_price', e.target.value)} /></Field>
          <Field label="Custo de compra (Kz)" hint="Interno — nunca visível ao cliente"><Input type="number" min={0} value={f.cost_price} onChange={(e) => set('cost_price', e.target.value)} /></Field>
          <Field label="Condição"><Select value={f.condition} onChange={(e) => set('condition', e.target.value)}><option value="novo">Novo</option><option value="recondicionado">Recondicionado</option><option value="usado">Usado</option></Select></Field>
          <Field label="Categoria"><Select value={f.category_id} onChange={(e) => set('category_id', e.target.value)}><option value="">—</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
          <Field label="Marca"><Select value={f.brand_id} onChange={(e) => set('brand_id', e.target.value)}><option value="">—</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></Field>
          <div><Field label="Stock disponível (calculado pelo armazém)"><Input type="number" readOnly value={product?.stock_total ?? 0} /></Field>
            <p className="mt-1 text-xs text-ink-muted">Depois de guardar o produto, regista a entrada e a localização no <Link href="/admin/armazem" className="text-brand-600 underline">Armazém virtual</Link>.</p>
          </div>
          <Field label="Stock mínimo"><Input type="number" min={0} value={f.min_stock} onChange={(e) => set('min_stock', e.target.value)} /></Field>
          <Field label="Cor"><Input value={f.color} onChange={(e) => set('color', e.target.value)} /></Field>
          <Field label="Armazenamento"><Input value={f.storage} onChange={(e) => set('storage', e.target.value)} placeholder="128 GB" /></Field>
          <Field label="RAM"><Input value={f.ram} onChange={(e) => set('ram', e.target.value)} placeholder="8 GB" /></Field>
          <Field label="Bateria (%)"><Input type="number" min={0} max={100} value={f.battery} onChange={(e) => set('battery', e.target.value)} /></Field>
          <Field label="Garantia (meses)"><Input type="number" min={0} value={f.warranty} onChange={(e) => set('warranty', e.target.value)} /></Field>
          <div className="sm:col-span-2"><PhotoUpload bucket="products" photos={photos} onChange={setPhotos}
            uploading={uploading} onUploadingChange={setUploading} disabled={loading} /></div>
          <Field label="Ou adicionar por URL (opcional)" className="sm:col-span-2"><Input type="url" value={f.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="https://…" /></Field>
          <Field label="Descrição" className="sm:col-span-2"><Textarea value={f.description} onChange={(e) => set('description', e.target.value)} /></Field>
          <div className="flex flex-wrap gap-5 sm:col-span-2">
            <Checkbox label="Activo na loja" checked={f.active} onChange={(e) => set('active', e.target.checked)} />
            <Checkbox label="Destaque na página inicial" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} />
            <Checkbox label="Em promoção" checked={f.promo} onChange={(e) => set('promo', e.target.checked)} />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" disabled={loading || uploading} onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={loading || uploading}>{product ? 'Guardar' : 'Criar produto'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
