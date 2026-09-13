'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfirmDialog } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { ProductForm as Form } from './form'

type Product = Database['public']['Tables']['products']['Row']

export function ProductRowActions({ product, categories, brands }: { product: Product; categories: { id: string; name: string }[]; brands: { id: string; name: string }[] }) {
  const [confirm, setConfirm] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ is_active: !product.is_active } as never).eq('id', product.id)
    setLoading(false); setConfirm(false)
    if (error) toast.error('Erro', error.message); else { toast.success(product.is_active ? 'Produto desactivado' : 'Produto activado'); router.refresh() }
  }
  return (
    <div className="flex items-center justify-end gap-1">
      <Form categories={categories} brands={brands} product={product} />
      <Button size="sm" variant="ghost" onClick={() => setConfirm(true)} className={product.is_active ? 'text-amber-700' : 'text-emerald-700'}>
        {product.is_active ? 'Desactivar' : 'Activar'}
      </Button>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={toggle} loading={loading}
        title={product.is_active ? 'Desactivar produto?' : 'Reactivar produto?'}
        description={product.is_active ? 'O produto deixa de aparecer na loja.' : 'O produto volta a aparecer na loja.'}
        confirmLabel={product.is_active ? 'Desactivar' : 'Activar'} danger={product.is_active} />
    </div>
  )
}
