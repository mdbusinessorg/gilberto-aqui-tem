'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export function MarkAllRead({ ids }: { ids: string[] }) {
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  if (ids.length === 0) return null
  const mark = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('notification_reads').insert(ids.map((id) => ({ notification_id: id, user_id: user.id })) as never)
    setLoading(false)
    router.refresh()
  }
  return <Button variant="outline" size="sm" loading={loading} onClick={mark}>Marcar todas como lidas ({ids.length})</Button>
}
