'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Link2 } from 'lucide-react'
import { Button, Modal, Field, Input, Select } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { ROLE_LABELS, STAFF_ROLES, type UserRole } from '@/lib/labels'

type Profile = { id: string; full_name: string; email: string | null; role: UserRole }

export function RoleManager({ employeeId, profileId, currentRole }: { employeeId: string; profileId: string | null; currentRole?: UserRole | null }) {
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [found, setFound] = React.useState<Profile | null>(null)
  const [role, setRole] = React.useState<UserRole>((currentRole as UserRole) ?? 'sales')
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()

  const find = async () => {
    setLoading(true); setFound(null)
    const supabase = createClient()
    const { data } = await supabase.rpc('find_profile_by_email', { p_email: email } as never)
    setLoading(false)
    if (!data) toast.error('Conta não encontrada', 'O funcionário tem de se registar em /registar primeiro com esse email.')
    else { setFound(data as Profile); setRole((data as Profile).role) }
  }

  const link = async () => {
    if (!found) return
    setLoading(true)
    const supabase = createClient()
    const { error: e1 } = await supabase.rpc('set_user_role', { p_user_id: found.id, p_role: role } as never)
    const { error: e2 } = e1 ? { error: e1 } : await supabase.from('employees').update({ profile_id: found.id, email: found.email } as never).eq('id', employeeId)
    setLoading(false)
    if (e2 || e1) toast.error('Erro', (e1 || e2)?.message)
    else { toast.success(`${found.full_name} agora é ${ROLE_LABELS[role]}`); setOpen(false); router.refresh() }
  }

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}><Link2 className="h-4 w-4" /> {profileId ? 'Função' : 'Vincular conta'}</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Vincular conta & função"
        description="O funcionário regista-se em /registar com o email dele; depois vinculas a conta aqui e escolhes a função.">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Field className="flex-1" label="Email da conta"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="funcionario@email.com" /></Field>
            <Button variant="outline" className="self-end" onClick={find} loading={loading}>Procurar</Button>
          </div>
          {found && (
            <div className="rounded-md border border-line p-3 text-sm">
              <p className="font-medium">{found.full_name} <span className="text-ink-muted">· {found.email}</span></p>
              <p className="text-xs text-ink-muted">Função actual: {ROLE_LABELS[found.role]}</p>
              <Field label="Nova função" className="mt-3">
                <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                  {STAFF_ROLES.filter((r) => r !== 'super_admin').map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  <option value="customer">Cliente (sem acesso ao painel)</option>
                </Select>
              </Field>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
            <Button onClick={link} disabled={!found} loading={loading}>Guardar função</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
