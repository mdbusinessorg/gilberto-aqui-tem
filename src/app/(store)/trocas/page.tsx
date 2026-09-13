'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, RefreshCw } from 'lucide-react'
import { Button, Field, Input, Select, Textarea, Card, CardHeader, CardBody } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { waLink, supportMessage } from '@/lib/whatsapp'

export default function TradePage() {
  const toast = useToast()
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [f, setF] = React.useState({ name: '', phone: '', brand: '', model: '', storage: '', condition: 'usado', battery: '', accessories: '', expected: '', notes: '' })
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.name.trim() || !f.phone.trim() || !f.brand.trim() || !f.model.trim()) { toast.error('Preenche nome, telefone, marca e modelo'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('trade_requests').insert({
      name: f.name, phone: f.phone, brand: f.brand, model: f.model, storage: f.storage || null,
      condition: f.condition, battery_health: f.battery ? Number(f.battery) : null,
      accessories: f.accessories || null, expected_value: f.expected ? Number(f.expected) : null,
      notes: f.notes || null, profile_id: user?.id ?? null,
    } as never)
    setLoading(false)
    if (error) toast.error('Não foi possível enviar', error.message)
    else setDone(true)
  }

  if (done)
    return (
      <div className="shell max-w-lg py-16 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-semibold">Pedido de avaliação enviado</h1>
        <p className="mt-2 text-ink-muted">Vamos analisar o teu aparelho e responder por WhatsApp com a proposta de valor.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => router.push('/loja')}>Ver a loja</Button>
          <a href={waLink(supportMessage())} target="_blank" rel="noopener" className="inline-flex h-10 items-center rounded-md border border-line px-4 text-sm font-medium hover:bg-surface">WhatsApp</a>
        </div>
      </div>
    )

  return (
    <div className="shell max-w-3xl py-10">
      <div className="mb-8 text-center">
        <RefreshCw className="mx-auto h-8 w-8 text-brand-600" />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Troca o teu dispositivo</h1>
        <p className="mt-2 text-ink-muted">Compramos, vendemos e trocamos. Envia os dados do teu aparelho e recebe uma proposta.</p>
      </div>
      <Card>
        <CardHeader title="Dados do aparelho" description="Quanto mais detalhes, mais precisa a avaliação." />
        <CardBody>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="O teu nome" required><Input value={f.name} onChange={(e) => set('name', e.target.value)} required /></Field>
            <Field label="Telefone / WhatsApp" required><Input value={f.phone} onChange={(e) => set('phone', e.target.value)} required placeholder="+244 …" /></Field>
            <Field label="Marca" required><Input value={f.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Apple, Samsung…" required /></Field>
            <Field label="Modelo" required><Input value={f.model} onChange={(e) => set('model', e.target.value)} placeholder="iPhone 13, Galaxy S23…" required /></Field>
            <Field label="Armazenamento"><Input value={f.storage} onChange={(e) => set('storage', e.target.value)} placeholder="128 GB" /></Field>
            <Field label="Estado">
              <Select value={f.condition} onChange={(e) => set('condition', e.target.value)}>
                <option value="usado">Usado — bom estado</option>
                <option value="usado_desgaste">Usado — com sinais de desgaste</option>
                <option value="avariado">Com avaria</option>
              </Select>
            </Field>
            <Field label="Saúde da bateria (%)"><Input type="number" min={0} max={100} value={f.battery} onChange={(e) => set('battery', e.target.value)} placeholder="Ex.: 87" /></Field>
            <Field label="Acessórios incluídos"><Input value={f.accessories} onChange={(e) => set('accessories', e.target.value)} placeholder="Caixa, carregador…" /></Field>
            <Field label="Valor esperado (Kz)"><Input type="number" min={0} value={f.expected} onChange={(e) => set('expected', e.target.value)} /></Field>
            <Field label="Observações" className="sm:col-span-2"><Textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Defeitos, histórico, o que queres em troca…" /></Field>
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">Enviar para avaliação</Button>
              <p className="mt-3 text-xs text-ink-muted">Respondemos normalmente no mesmo dia útil por WhatsApp.</p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
