'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button, Field, Input, Checkbox } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'

export function SettingsForm({ settingKey, value, readOnly }: { settingKey: string; value: Record<string, unknown>; readOnly?: boolean }) {
  const [form, setForm] = React.useState<Record<string, unknown>>(value)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()

  const save = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('store_settings').upsert({ key: settingKey, value: form } as never)
    setLoading(false)
    if (error) toast.error('Erro', error.message); else { toast.success('Definições guardadas'); router.refresh() }
  }

  return (
    <div className="space-y-3">
      {Object.entries(form).map(([k, v]) => {
        if (typeof v === 'boolean')
          return <Checkbox key={k} label={k} checked={v} disabled={readOnly} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.checked }))} />
        if (Array.isArray(v))
          return <Field key={k} label={k} hint="Separado por vírgulas"><Input disabled={readOnly} value={(v as unknown[]).join(', ')} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} /></Field>
        return (
          <Field key={k} label={k}>
            <Input disabled={readOnly} type={typeof v === 'number' ? 'number' : 'text'} value={String(v ?? '')}
              onChange={(e) => setForm((p) => ({ ...p, [k]: typeof v === 'number' ? Number(e.target.value) : e.target.value }))} />
          </Field>
        )
      })}
      {!readOnly && <Button size="sm" onClick={save} loading={loading}>Guardar</Button>}
    </div>
  )
}
