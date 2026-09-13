'use client'
import * as React from 'react'
import { Sparkles } from 'lucide-react'
import { Button, Card, CardBody } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'

type SpinResult = { ok: boolean; prize_label?: string; coupon_code?: string; points?: number; error?: string }

export function WheelSection() {
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<SpinResult | null>(null)
  const toast = useToast()
  const spin = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.rpc('spin_wheel')
    setLoading(false)
    if (error) { toast.error('Não foi possível girar', error.message); return }
    const r = data as SpinResult
    setResult(r)
    if (r.ok) toast.success(r.prize_label ?? 'Prémio!')
    else toast.error(r.error ?? 'Tenta mais tarde')
  }
  return (
    <Card className="mt-6 border-brand-200 bg-gradient-to-br from-brand-50 to-white">
      <CardBody className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-brand-600" />
          <div>
            <p className="font-semibold">Roleta de recompensas</p>
            <p className="text-sm text-ink-muted">Gira para ganhar pontos e cupões.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {result?.ok && <span className="text-sm font-medium text-emerald-700">{result.prize_label}{result.coupon_code ? ` — ${result.coupon_code}` : ''}</span>}
          <Button onClick={spin} loading={loading}>Girar</Button>
        </div>
      </CardBody>
    </Card>
  )
}
