'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfirmDialog } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { ProductForm as Form } from './form'

type Product = Database['public']['Tables']['products']['Row']
type ProductImage = Database['public']['Tables']['product_images']['Row']

export function ProductRowActions({ product, images, categories, brands }: { product: Product; images: ProductImage[]; categories: { id: string; name: string }[]; brands: { id: string; name: string }[] }) {
  const [confirm, setConfirm] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const remove = async () => {
    if (loading) return
    setLoading(true)
    try {
      const supabase = createClient()
      const [stock, movements] = await Promise.all([
        supabase.from('inventory').select('quantity').eq('product_id', product.id).gt('quantity', 0).limit(1),
        supabase.from('inventory_movements').select('id').eq('product_id', product.id).limit(1),
      ])
      if (stock.error || movements.error) throw new Error('Não foi possível consultar o inventário.')
      if (product.stock_total > 0 || stock.data.length || movements.data.length) {
        toast.error('Produto com stock ou histórico', 'Usa Desactivar para retirar da loja e manter o controlo do armazém.')
        setConfirmDelete(false)
        return
      }
      const { error } = await supabase.from('products').delete().eq('id', product.id).select('id').single()
      if (error) throw error
      toast.success('Produto removido')
      setConfirmDelete(false)
      router.refresh()
    } catch {
      toast.error('Não foi possível remover', 'Apenas administradores podem apagar produtos. Podes usar Desactivar para retirar o produto da loja.')
    } finally {
      setLoading(false)
    }
  }
  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ is_active: !product.is_active } as never).eq('id', product.id)
    setLoading(false); setConfirm(false)
    if (error) toast.error('Erro', error.message); else { toast.success(product.is_active ? 'Produto desactivado' : 'Produto activado'); router.refresh() }
  }
  return (
    <div className="flex items-center justify-end gap-1">
      <Form categories={categories} brands={brands} product={product} images={images} />
      <Button size="sm" variant="ghost" onClick={() => setConfirm(true)} className={product.is_active ? 'text-amber-700' : 'text-emerald-700'}>
        {product.is_active ? 'Desactivar' : 'Activar'}
      </Button>
      <Button size="sm" variant="ghost" className="text-red-600" disabled={loading} onClick={() => setConfirmDelete(true)}>Remover</Button>
      <ConfirmDialog open={confirmDelete} onClose={() => { if (!loading) setConfirmDelete(false) }} onConfirm={remove} loading={loading}
        title="Remover produto definitivamente?" description={`O produto «${product.name}» e as suas imagens saem do catálogo. Esta acção não pode ser desfeita. Para apenas ocultar o produto, usa Desactivar.`}
        confirmLabel="Remover produto" danger />
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={toggle} loading={loading}
        title={product.is_active ? 'Desactivar produto?' : 'Reactivar produto?'}
        description={product.is_active ? 'O produto deixa de aparecer na loja.' : 'O produto volta a aparecer na loja.'}
        confirmLabel={product.is_active ? 'Desactivar' : 'Activar'} danger={product.is_active} />
    </div>
  )
}
