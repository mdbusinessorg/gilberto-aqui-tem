import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/supabase/server'
import { STAFF_ROLES } from '@/lib/labels'
import { AdminShell } from '@/components/admin/shell'

export const metadata = { title: 'Gestão' }
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSessionProfile()
  if (!user) redirect('/entrar?next=/admin')
  if (!profile || !profile.is_active || !STAFF_ROLES.includes(profile.role)) redirect('/')
  return <AdminShell user={{ name: profile.full_name, role: profile.role }}>{children}</AdminShell>
}
