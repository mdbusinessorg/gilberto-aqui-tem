'use client'
import * as React from 'react'
import Link from '@/components/ui/navigation-link'
import { useRouter } from 'next/navigation'
import { Camera, LogIn, LogOut, CheckCircle2, X, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { formatTime, todayISO } from '@/lib/utils'

type Today = { check_in: string | null; check_out: string | null; check_in_photo?: string | null; late_minutes: number } | null

export function ClockFab() {
  const [employeeId, setEmployeeId] = React.useState<string | null>(null)
  const [today, setToday] = React.useState<Today>(null)
  const [ready, setReady] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [shot, setShot] = React.useState<string | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const toast = useToast()
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

  const stop = React.useCallback(() => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null }, [])
  const start = async () => {
    if (!action) { router.push('/admin/pontualidade'); return }
    setShot(null); setOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
    } catch { toast.error('Câmara indisponível', 'Permite o acesso à câmara para registar o ponto.') }
  }
  React.useEffect(() => () => stop(), [stop])

  const capture = () => {
    const v = videoRef.current; if (!v) return
    const c = document.createElement('canvas'); c.width = v.videoWidth || 640; c.height = v.videoHeight || 480
    c.getContext('2d')?.drawImage(v, 0, 0)
    setShot(c.toDataURL('image/jpeg', 0.8)); stop()
  }

  const submit = async () => {
    if (!action || !shot || !employeeId) return
    setLoading(true)
    const supabase = createClient()
    const blob = await (await fetch(shot)).blob()
    const path = `${employeeId}/${todayISO()}-${action}-${Date.now()}.jpg`
    const { error: upErr } = await supabase.storage.from('attendance').upload(path, blob, { contentType: 'image/jpeg', upsert: false })
    if (upErr) { setLoading(false); toast.error('Erro ao guardar a foto', upErr.message); return }
    const url = supabase.storage.from('attendance').getPublicUrl(path).data.publicUrl
    const { error } = action === 'clock_in'
      ? await supabase.rpc('clock_in', { p_device: navigator.userAgent, p_photo: url })
      : await supabase.rpc('clock_out', { p_photo: url })
    setLoading(false)
    if (error) { toast.error('Erro', error.message); return }
    toast.success(action === 'clock_in' ? 'Entrada registada' : 'Saída registada')
    setOpen(false)
    await load()
    router.refresh()
  }

  if (!ready || !employeeId) return null

  const label = action === 'clock_in' ? 'Check-in' : action === 'clock_out' ? `Entrada ${formatTime(today!.check_in!)}` : 'Dia completo'

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 print:hidden">
        <span className="hidden rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm sm:block">{label}</span>
        <button
          type="button"
          onClick={start}
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

      {open && (
        <div className="clock-modal" role="dialog" aria-label="Registo de ponto">
          <div className="clock-modal-box">
            <button type="button" className="clock-close" onClick={() => { stop(); setOpen(false) }} aria-label="Fechar"><X className="h-4 w-4" /></button>
            <h3>{action === 'clock_in' ? 'Check-in' : 'Check-out'} — {new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</h3>
            <p>A fotografia fica no registo de ponto para confirmação.</p>
            <div className="clock-view">
              {shot ? <img src={shot} alt="Fotografia captada" /> : <video ref={videoRef} playsInline muted autoPlay />}
            </div>
            <div className="flex justify-center gap-2">
              {!shot
                ? <Button onClick={capture}><Camera className="h-4 w-4" /> Tirar foto</Button>
                : <>
                    <Button variant="outline" onClick={start}>Repetir</Button>
                    <Button onClick={submit} loading={loading}><CheckCircle2 className="h-4 w-4" /> Confirmar {action === 'clock_in' ? 'entrada' : 'saída'}</Button>
                  </>}
            </div>
            <Link href="/admin/pontualidade" className="mt-2 block text-center text-xs text-ink-muted hover:text-brand-700">Ver fotos e registos de ponto →</Link>
          </div>
        </div>
      )}
    </>
  )
}
