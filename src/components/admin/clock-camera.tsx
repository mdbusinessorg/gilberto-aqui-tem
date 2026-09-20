'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Camera, LogIn, LogOut, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/lib/utils'

type Today = { check_in: string | null; check_out: string | null; check_in_photo?: string | null; check_out_photo?: string | null; late_minutes: number } | null | undefined

export function ClockCamera({ employeeId, today, compact }: { employeeId: string; today: Today; compact?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [shot, setShot] = React.useState<string | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const toast = useToast()
  const router = useRouter()
  const action: 'clock_in' | 'clock_out' | null = !today?.check_in ? 'clock_in' : !today.check_out ? 'clock_out' : null

  const stop = React.useCallback(() => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null }, [])
  const start = async () => {
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
    if (!action || !shot) return
    setLoading(true)
    const supabase = createClient()
    const blob = await (await fetch(shot)).blob()
    const path = `${employeeId}/${new Date().toISOString().slice(0, 10)}-${action}.jpg`
    const { error: upErr } = await supabase.storage.from('attendance').upload(path, blob, { contentType: 'image/jpeg', upsert: true })
    if (upErr) { setLoading(false); toast.error('Erro ao guardar a foto', upErr.message); return }
    const url = supabase.storage.from('attendance').getPublicUrl(path).data.publicUrl
    const { error } = action === 'clock_in'
      ? await supabase.rpc('clock_in', { p_device: navigator.userAgent, p_photo: url })
      : await supabase.rpc('clock_out', { p_photo: url })
    setLoading(false)
    if (error) { toast.error('Erro', error.message); return }
    toast.success(action === 'clock_in' ? 'Entrada registada' : 'Saída registada')
    setOpen(false); router.refresh()
  }

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
        <Button size={compact ? 'sm' : 'lg'} className={compact ? '' : 'clock-btn'} onClick={start}>
          {action === 'clock_in' ? <LogIn className="h-5 w-5" /> : <LogOut className="h-5 w-5" />}
          {action === 'clock_in' ? 'Fazer check-in com foto' : 'Fazer check-out com foto'}
        </Button>
      ) : <p className="inline-flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Dia completo</p>}

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
          </div>
        </div>
      )}
    </div>
  )
}
