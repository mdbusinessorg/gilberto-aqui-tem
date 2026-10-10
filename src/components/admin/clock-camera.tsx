'use client'
import * as React from 'react'
import { Camera, LogIn, LogOut, Clock3, UserX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO, formatTime } from '@/lib/utils'
import { FaceCapture } from './face-capture'
import { useRouter } from 'next/navigation'

type Emp = { id: string; full_name: string; department: string | null; schedule_start: string; schedule_end: string }
type Today = { check_in: string | null; check_out: string | null; check_in_photo: string | null; check_out_photo: string | null } | null

export function ClockCamera({ compact = false }: { compact?: boolean }) {
  const [employee, setEmployee] = React.useState<Emp | null>(null)
  const [today, setToday] = React.useState<Today>(null)
  const [loaded, setLoaded] = React.useState(false)
  const [open, setOpen] = React.useState<false | 'clock_in' | 'clock_out'>(false)
  const router = useRouter()

  const load = React.useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: emp } = await supabase.from('employees').select('id, full_name, department, schedule_start, schedule_end').eq('profile_id', user.id).eq('status', 'activo').limit(1).maybeSingle()
      setEmployee(emp || null)
      if (emp) {
        const { data: t } = await supabase.from('attendance').select('check_in, check_out, check_in_photo, check_out_photo').eq('employee_id', emp.id).eq('work_date', todayISO()).limit(1).maybeSingle()
        setToday(t ? { ...t, check_in_photo: t.check_in_photo ?? null, check_out_photo: t.check_out_photo ?? null } : null)
      }
    }
    setLoaded(true)
  }, [])

  React.useEffect(() => { load() }, [load])

  if (!loaded) return <div className="clock-card"><div className="clock-skel" /></div>
  if (!employee) {
    if (compact) return null
    return (
      <div className="clock-card">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          <UserX className="h-5 w-5 shrink-0" />
          <p>A tua conta de staff ainda não está vinculada a uma ficha de funcionário. Pede à gestão para criar a ficha com o teu email de acesso.</p>
        </div>
      </div>
    )
  }

  const done = today?.check_in && today?.check_out
  const next = done ? null : today?.check_in ? 'clock_out' : 'clock_in'

  return (
    <div className={`clock-card ${compact ? 'clock-card-compact' : ''}`}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0">
          <p className="clock-name">{employee.full_name}</p>
          <p className="clock-sched">{employee.department || 'Equipa'} · {employee.schedule_start.slice(0, 5)}–{employee.schedule_end.slice(0, 5)}</p>
        </div>
        <div className="clock-times">
          <div className="clock-time">
            <span className="clock-time-label"><LogIn className="h-3.5 w-3.5" /> Entrada</span>
            <span className="clock-time-val">{today?.check_in ? formatTime(today.check_in) : '—:—'}</span>
          </div>
          <div className="clock-time">
            <span className="clock-time-label"><LogOut className="h-3.5 w-3.5" /> Saída</span>
            <span className="clock-time-val">{today?.check_out ? formatTime(today.check_out) : '—:—'}</span>
          </div>
        </div>
        {(today?.check_in_photo || today?.check_out_photo) && (
          <div className="clock-photos">
            {today.check_in_photo && <img src={today.check_in_photo} alt="Entrada" className="clock-photo" />}
            {today.check_out_photo && <img src={today.check_out_photo} alt="Saída" className="clock-photo" />}
          </div>
        )}
        <div className="ms-auto">
          {done ? (
            <span className="clock-done"><Clock3 className="h-4 w-4" /> Dia completo — obrigado!</span>
          ) : (
            <button type="button" className={`btn ${next === 'clock_in' ? 'btn-primary' : 'btn-dark'}`} onClick={() => setOpen(next ?? false)}>
              <Camera className="h-4 w-4" /> Fazer {next === 'clock_in' ? 'check-in' : 'check-out'} facial
            </button>
          )}
        </div>
      </div>
      <FaceCapture open={open !== false} action={open || null} employeeId={employee.id} employeeName={employee.full_name} onClose={() => setOpen(false)} onDone={() => { load(); router.refresh() }} />
    </div>
  )
}
