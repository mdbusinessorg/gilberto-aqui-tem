import { createClient, getSessionProfile } from '@/lib/supabase/server'
import { PageHeader, Card, CardHeader, CardBody } from '@/components/ui'
import { SettingsForm } from './form'

export const dynamic = 'force-dynamic'

const KEYS = ['store', 'checkout', 'loyalty', 'wheel', 'attendance', 'dashboard'] as const
const TITLES: Record<string, string> = {
  store: 'Loja', checkout: 'Checkout & entregas', loyalty: 'Fidelidade & pontos', wheel: 'Roleta de recompensas', attendance: 'Pontualidade', dashboard: 'Painel',
}

export default async function SettingsPage() {
  const supabase = createClient()
  const { profile } = await getSessionProfile()
  const isAdmin = profile && ['super_admin', 'admin'].includes(profile.role)
  const { data: settings } = await supabase.from('store_settings').select('*')
  const map = new Map((settings ?? []).map((s) => [s.key, s.value]))
  return (
    <>
      <PageHeader title="Definições" description={isAdmin ? 'Configuração da loja, fidelidade e regras operacionais.' : 'Só administradores podem alterar definições.'} />
      <div className="grid gap-6 xl:grid-cols-2">
        {KEYS.map((k) => (
          <Card key={k}>
            <CardHeader title={TITLES[k]} description={!isAdmin ? 'Leitura' : undefined} />
            <CardBody>
              <SettingsForm settingKey={k} value={(map.get(k) ?? {}) as Record<string, unknown>} readOnly={!isAdmin} />
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  )
}
