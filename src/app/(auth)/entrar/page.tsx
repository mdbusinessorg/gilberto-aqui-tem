'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Button, Field, Input, Card, CardBody } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const toast = useToast()
  const [loading, setLoading] = React.useState(false)
  const [f, setF] = React.useState({ email: '', password: '' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password })
    setLoading(false)
    if (error) { toast.error('Não foi possível entrar', 'Verifica o email e a palavra-passe.'); return }
    router.push(params.get('next') || '/conta')
    router.refresh()
  }

  return (
    <Card>
      <CardBody className="p-6">
        <h1 className="text-xl font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-ink-muted">Acede à tua conta ou ao painel da loja.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Email" required><Input type="email" value={f.email} onChange={(e) => setF((p) => ({ ...p, email: e.target.value }))} required autoComplete="email" /></Field>
          <Field label="Palavra-passe" required><Input type="password" value={f.password} onChange={(e) => setF((p) => ({ ...p, password: e.target.value }))} required autoComplete="current-password" /></Field>
          <Button type="submit" loading={loading} className="w-full" size="lg">Entrar</Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-muted">Não tens conta? <Link href="/registar" className="font-medium text-brand-700">Criar conta</Link></p>
        <p className="mt-2 text-center text-xs text-ink-muted">Podes comprar sem conta — <Link href="/loja" className="underline">continuar como convidado</Link>.</p>
      </CardBody>
    </Card>
  )
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>
}
