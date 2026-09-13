'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Att = Database['public']['Tables']['attendance']['Row']

export function ClockButtons({ employeeId, today }: { employeeId: string; today: Att | null | undefined }) {
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const act = async (fn: 'clock_in' | 'clock_out') => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.rpc(fn as never, fn === 'clock_in' ? { p_device: navigator.userAgent } as never : undefined as never)
    setLoading(false)
    if (error) toast.error('Erro', error.message)
    else { toast.success(fn === 'clock_in' ? 'Entrada registada' : 'Saída registada'); router.refresh() }
  }
  if (!today?.check_in)
    return <Button size="sm" onClick={() => act('clock_in')} loading={loading}><LogIn className="h-4 w-4" /> Check-in</Button>
  if (!today.check_out)
    return <Button size="sm" variant="outline" onClick={() => act('clock_out')} loading={loading}><LogOut className="h-4 w-4" /> Check-out</Button>
  return <span className="text-sm text-emerald-600">Dia completo</span>
}
