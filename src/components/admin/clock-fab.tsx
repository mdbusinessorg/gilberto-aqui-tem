'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut, ClipboardCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatTime, todayISO } from '@/lib/utils'
import { FaceCapture } from '@/components/admin/face-capture'

type Today = { check_in: string | null; check_out: string | null; check_in_photo?: string | null; late_minutes: number } | null

export function ClockFab() {
  const [employeeId, setEmployeeId] = React.useState<string | null>(null)
  const [today, setToday] = React.useState<Today>(null)
  const [ready, setReady] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const load = React.useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setReady(true); return }
    const { data: emp } = await supabase.from('employees').select('id').eq('profile_id', user.id).eq('status', 'activo').maybeSingle()
    if (!emp) { setReady(true); return }
    setEmployeeId(emp.id)
    const { data: att } = await supabase.from('attendance').select('check_in,check_out,check_in_photo,late_minutes').eq('employee_id', emp.id).eq('work_date', todayISO()).maybeSingle()
    setToday(att)
    setReady(true)
  }, [])

  React.useEffect(() => { void load() }, [load])

  const action: 'clock_in' | 'clock_out' | null = !today?.check_in ? 'clock_in' : !today.check_out ? 'clock_out' : null

  if (!ready || !employeeId) return null

  const label = action === 'clock_in' ? 'Check-in' : action === 'clock_out' ? `Entrada ${formatTime(today!.check_in!)}` : 'Dia completo'

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 print:hidden">
        <span className="hidden rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm sm:block">{label}</span>
        <button
          type="button"
          onClick={() => (action ? setOpen(true) : router.push('/admin/pontualidade'))}
          aria-label={action === 'clock_in' ? 'Fazer check-in' : action === 'clock_out' ? 'Fazer check-out' : 'Ver registo de ponto'}
          title={label}
          className={
            action === 'clock_in'
              ? 'relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition-transform hover:scale-105 active:scale-95'
              : action === 'clock_out'
                ? 'flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-transform hover:scale-105 active:scale-95'
                : 'flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white text-emerald-600 shadow-lg transition-transform hover:scale-105 active:scale-95'
          }
        >
          {action === 'clock_in' && <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/40" aria-hidden />}
          {action === 'clock_in' ? <LogIn className="relative h-6 w-6" /> : action === 'clock_out' ? <LogOut className="h-6 w-6" /> : <ClipboardCheck className="h-6 w-6" />}
        </button>
      </div>
      <FaceCapture open={open} action={action} employeeId={employeeId} onClose={() => setOpen(false)} onDone={() => { void load(); router.refresh() }} />
    </>
  )
}
