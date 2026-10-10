'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatTime } from '@/lib/utils'
import { FaceCapture } from '@/components/admin/face-capture'

type Today = { check_in: string | null; check_out: string | null; check_in_photo?: string | null; check_out_photo?: string | null; late_minutes: number } | null | undefined

export function ClockCamera({ employeeId, today, compact }: { employeeId: string; today: Today; compact?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const action: 'clock_in' | 'clock_out' | null = !today?.check_in ? 'clock_in' : !today.check_out ? 'clock_out' : null

  return (
    <div className={compact ? '' : 'clock-card'}>
      {!compact && (
        <div className="clock-status">
          <div><p>Entrada</p><strong>{today?.check_in ? formatTime(today.check_in) : '—'}</strong>{today?.late_minutes ? <small>+{today.late_minutes} min</small> : null}</div>
          <div><p>Saída</p><strong>{today?.check_out ? formatTime(today.check_out) : '—'}</strong></div>
          {today?.check_in_photo && <img src={today.check_in_photo} alt="Foto de entrada" className="clock-thumb" />}
        </div>
      )}
      {action ? (
        <Button size={compact ? 'sm' : 'lg'} className={compact ? '' : 'clock-btn'} onClick={() => setOpen(true)}>
          {action === 'clock_in' ? <LogIn className="h-5 w-5" /> : <LogOut className="h-5 w-5" />}
          {action === 'clock_in' ? 'Fazer check-in facial' : 'Fazer check-out facial'}
        </Button>
      ) : <p className="inline-flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Dia completo</p>}
      <FaceCapture open={open} action={action} employeeId={employeeId} onClose={() => setOpen(false)} onDone={() => router.refresh()} />
    </div>
  )
}
