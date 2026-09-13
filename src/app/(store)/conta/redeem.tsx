'use client'
import * as React from 'react'
import { Gift } from 'lucide-react'
import { Button, Card, CardBody, Input, Field } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { formatKz } from '@/lib/utils'

export function RedeemCard({ points, min, kzPerPoint }: { points: number; min: number; kzPerPoint: number }) {
  const [amount, setAmount] = React.useState(min)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const redeem = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.rpc('redeem_points', { p_points: amount } as never)
    setLoading(false)
    if (error) toast.error('Não foi possível resgatar', error.message)
    else toast.success('Cupão criado', 'Verifica na tua conta ou usa no checkout.')
  }
  return (
    <Card className="mt-6 border-brand-200 bg-brand-50/40">
      <CardBody className="flex flex-wrap items-end gap-3">
        <Gift className="h-5 w-5 text-brand-600" />
        <div className="flex-1">
          <p className="font-medium">Resgata pontos em cupão</p>
          <p className="text-sm text-ink-muted">Cada ponto vale {formatKz(kzPerPoint)}. Mínimo {min} pontos.</p>
        </div>
        <Field><Input type="number" min={min} max={points} step={min} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-28" /></Field>
        <Button onClick={redeem} loading={loading} disabled={amount < min || amount > points}>Resgatar {formatKz(amount * kzPerPoint)}</Button>
      </CardBody>
    </Card>
  )
}
