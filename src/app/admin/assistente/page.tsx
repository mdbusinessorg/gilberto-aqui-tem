import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/supabase/server'
import { isAdminRole } from '@/lib/labels'
import { PageHeader, Card } from '@/components/ui'
import { VoiceAssistant } from './assistant'

export const metadata = { title: 'Assistente' }
export const dynamic = 'force-dynamic'

export default async function AssistantPage() {
  const { profile } = await getSessionProfile()
  if (!profile || !isAdminRole(profile.role)) redirect('/admin')
  return (
    <>
      <PageHeader title="Assistente do administrador" description="Só tu tens acesso. Conhece vendas, pedidos, stock, movimentos, pontualidade e tarefas em tempo real." />
      <Card className="p-0 overflow-hidden"><VoiceAssistant adminName={profile.full_name?.split(' ')[0] ?? 'administrador'} /></Card>
    </>
  )
}
