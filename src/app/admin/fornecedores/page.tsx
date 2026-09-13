import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, Table, THead, TBody, Badge, EmptyState } from '@/components/ui'
import { SupplierForm } from './form'

export const dynamic = 'force-dynamic'

export default async function SuppliersPage() {
  const supabase = createClient()
  const { data: suppliers } = await supabase.from('suppliers').select('*').order('name')
  return (
    <>
      <PageHeader title="Fornecedores" description={`${suppliers?.length ?? 0} fornecedores`} actions={<SupplierForm />} />
      <Card>
        <Table>
          <THead><tr><th>Nome</th><th>Contacto</th><th>Telefone</th><th>Email</th><th>Produtos</th><th>Estado</th><th></th></tr></THead>
          <TBody>
            {(suppliers ?? []).map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{s.name}</td>
                <td className="text-ink-muted">{s.contact_name ?? '—'}</td>
                <td>{s.phone ?? '—'}</td>
                <td className="text-ink-muted">{s.email ?? '—'}</td>
                <td className="max-w-52 truncate text-xs text-ink-muted">{s.products_supplied ?? '—'}</td>
                <td><Badge tone={s.is_active ? 'green' : 'neutral'}>{s.is_active ? 'Activo' : 'Inactivo'}</Badge></td>
                <td><SupplierForm supplier={s} /></td>
              </tr>
            ))}
          </TBody>
        </Table>
        {!suppliers?.length && <EmptyState compact title="Sem fornecedores" />}
      </Card>
    </>
  )
}
