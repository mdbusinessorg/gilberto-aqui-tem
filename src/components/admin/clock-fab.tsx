'use client'
import * as React from 'react'
import { Clock, LogIn, LogOut, ClipboardCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO, formatTime } from '@/lib/utils'
import { FaceCapture } from './face-capture'
import { useRouter } from 'next/navigation'

type Emp = { id: string; full_name: string }
type Today = { check_in: string | null; check_out: string | null } | null

export function ClockFab() {
  const [employee, setEmployee] = React.useState<Emp | null>(null)
  const [today, setToday] = React.useState<Today>(null)
  const [open, setOpen] = React.useState<false | 'clock_in' | 'clock_out'>(false)
  const router = useRouter()

  const load = React.useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setEmployee(null); return }
    const { data: emp } = await supabase.from('employees').select('id, full_name').eq('profile_id', user.id).eq('status', 'activo').limit(1).maybeSingle()
    setEmployee(emp || null)
    if (!emp) return
    const { data: t } = await supabase.from('attendance').select('check_in, check_out').eq('employee_id', emp.id).eq('work_date', todayISO()).limit(1).maybeSingle()
    setToday(t || null)
  }, [])

  React.useEffect(() => { load() }, [load])

  if (!employee) return null
  const done = today?.check_in && today?.check_out
  const next = done ? null : today?.check_in ? 'clock_out' : 'clock_in'

  return (
    <>
      <button
        type="button"
        className={`clock-fab ${done ? 'clock-fab-done' : next === 'clock_out' ? 'clock-fab-out' : 'clock-fab-in'}`}
        onClick={() => next && setOpen(next)}
        title={done ? `Dia completo — entrada ${formatTime(today!.check_in!)} · saída ${formatTime(today!.check_out!)}` : next === 'clock_in' ? 'Marcar entrada (check-in)' : 'Registar saída (check-out)'}
        aria-label={done ? 'Ponto do dia completo' : next === 'clock_in' ? 'Fazer check-in' : 'Fazer check-out'}
      >
        {done ? <ClipboardCheck className="h-6 w-6" /> : next === 'clock_in' ? <LogIn className="h-6 w-6" /> : <LogOut className="h-6 w-6" />}
        <span className="clock-fab-ring" aria-hidden />
        {!done && <Clock className="clock-fab-dot h-3 w-3" aria-hidden />}
      </button>
      <FaceCapture open={open !== false} action={open || null} employeeId={employee.id} employeeName={employee.full_name} onClose={() => setOpen(false)} onDone={() => { load(); router.refresh() }} />
    </>
  )
}
