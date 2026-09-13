'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Field, Input, Card, CardBody } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = React.useState(false)
  const [f, setF] = React.useState({ name: '', phone: '', email: '', password: '' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (f.password.length < 6) { toast.error('A palavra-passe deve ter pelo menos 6 caracteres'); return }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: f.email, password: f.password,
      options: { data: { full_name: f.name, phone: f.phone } },
    })
    if (!error && data.user) {
      await supabase.from('profiles').update({ full_name: f.name, phone: f.phone } as never).eq('id', data.user.id)
      await supabase.rpc('ensure_my_customer')
    }
    setLoading(false)
    if (error) { toast.error('Não foi possível criar a conta', error.message); return }
    toast.success('Conta criada', 'Bem-vindo à Gilberto Aqui Tem.')
    router.push('/conta')
    router.refresh()
  }

  return (
    <Card>
      <CardBody className="p-6">
        <h1 className="text-xl font-semibold">Criar conta</h1>
        <p className="mt-1 text-sm text-ink-muted">Guarda favoritos, acompanha pedidos e acumula recompensas.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Nome completo" required><Input value={f.name} onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))} required /></Field>
          <Field label="Telefone / WhatsApp"><Input value={f.phone} onChange={(e) => setF((p) => ({ ...p, phone: e.target.value }))} placeholder="+244 …" /></Field>
          <Field label="Email" required><Input type="email" value={f.email} onChange={(e) => setF((p) => ({ ...p, email: e.target.value }))} required autoComplete="email" /></Field>
          <Field label="Palavra-passe" required hint="Mínimo 6 caracteres"><Input type="password" value={f.password} onChange={(e) => setF((p) => ({ ...p, password: e.target.value }))} required autoComplete="new-password" /></Field>
          <Button type="submit" loading={loading} className="w-full" size="lg">Criar conta</Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-muted">Já tens conta? <Link href="/entrar" className="font-medium text-brand-700">Entrar</Link></p>
      </CardBody>
    </Card>
  )
}
