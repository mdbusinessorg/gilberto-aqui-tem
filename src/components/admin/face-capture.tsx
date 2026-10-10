'use client'
import * as React from 'react'
import { Camera, CheckCircle2, X, ScanFace, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { todayISO } from '@/lib/utils'

type Phase = 'camera' | 'review' | 'verifying' | 'success' | 'error'

export function FaceCapture({ open, action, employeeId, employeeName, onClose, onDone }: {
  open: boolean
  action: 'clock_in' | 'clock_out' | null
  employeeId: string
  employeeName?: string
  onClose: () => void
  onDone: () => void
}) {
  const [phase, setPhase] = React.useState<Phase>('camera')
  const [shot, setShot] = React.useState<string | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const toast = useToast()

  const stop = React.useCallback(() => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null }, [])

  const successTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const finish = React.useCallback(() => { if (successTimer.current) clearTimeout(successTimer.current); onDone(); onClose() }, [onDone, onClose])

  React.useEffect(() => {
    if (!open) return
    setPhase('camera'); setShot(null)
    let cancelled = false
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false })
      .then(async (stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      })
      .catch(() => { toast.error('Câmara indisponível', 'Permite o acesso à câmara para a verificação facial.'); setPhase('error') })
    return () => { cancelled = true; stop() }
  }, [open, stop, toast])

  if (!open) return null

  const capture = () => {
    const v = videoRef.current; if (!v) return
    if (!v.videoWidth || v.readyState < 2) { toast.error('Câmara a iniciar', 'Espera 1 segundo e toca em Verificar outra vez.'); return }
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d')?.drawImage(v, 0, 0)
    setShot(c.toDataURL('image/jpeg', 0.8)); stop(); setPhase('review')
  }

  const retry = async () => {
    setShot(null); setPhase('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
    } catch { setPhase('error') }
  }

  const verify = async () => {
    if (!shot || !action) return
    setPhase('verifying')
    try {
      const supabase = createClient()
      const blob = await (await fetch(shot)).blob()
      const path = `${employeeId}/${todayISO()}-${action}-${Date.now()}.jpg`
      const { error: upErr } = await supabase.storage.from('attendance').upload(path, blob, { contentType: 'image/jpeg', upsert: false })
      if (upErr) throw new Error(upErr.message)
      const url = supabase.storage.from('attendance').getPublicUrl(path).data.publicUrl
      const { error } = action === 'clock_in'
        ? await supabase.rpc('clock_in', { p_device: navigator.userAgent, p_photo: url })
        : await supabase.rpc('clock_out', { p_photo: url })
      if (error) throw new Error(error.message)
      const hora = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Luanda' })
      void supabase.rpc('notify_staff', {
        p_title: `${action === 'clock_in' ? 'Ponto marcado' : 'Saída registada'}: ${employeeName || 'Funcionário'}`,
        p_body: `${action === 'clock_in' ? 'Check-in' : 'Check-out'} às ${hora} · verificação facial`,
        p_kind: 'pontualidade', p_priority: 'normal', p_link: '/admin/pontualidade',
        p_roles: ['super_admin', 'admin', 'manager'],
      })
      setPhase('success')
      // fica visível até o utilizador confirmar (máx 6s de auto-fecho)
      successTimer.current = setTimeout(finish, 6000)
    } catch (e) {
      toast.error('Verificação falhou', (e as Error).message)
      setPhase('error')
    }
  }

  const title = action === 'clock_in' ? 'Check-in' : 'Check-out'
  return (
    <div className="face-modal" role="dialog" aria-label="Verificação facial">
      <div className="face-box">
        <button type="button" className="clock-close" onClick={onClose} aria-label="Fechar"><X className="h-4 w-4" /></button>
        <h3 className="face-title"><ScanFace className="h-5 w-5 text-brand-600" /> {title} — verificação facial</h3>
        <p className="face-sub">{phase === 'camera' ? 'Centra o rosto no oval e toca em Verificar' : phase === 'verifying' ? 'A verificar a tua identidade…' : phase === 'success' ? 'Ponto registado' : 'Confirma a fotografia para registar o ponto'}</p>

        <div className={`face-oval ${phase === 'verifying' ? 'scanning' : ''} ${phase === 'success' ? 'ok' : ''} ${phase === 'error' ? 'err' : ''}`}>
          {phase === 'success' ? (
            <div className="face-success">
              {shot && <img className="face-success-photo" src={shot} alt="" />}
              <span className="face-success-badge"><CheckCircle2 /></span>
              <span className="face-success-txt">{action === 'clock_out' ? 'Check-out' : 'Ponto'} marcado com sucesso</span>
            </div>
          ) : shot ? (
            <img src={shot} alt="Fotografia captada" />
          ) : (
            <video ref={videoRef} playsInline muted autoPlay />
          )}
          {(phase === 'camera' || phase === 'verifying') && <span className="face-scanline" aria-hidden />}
          {phase !== 'success' && <span className="face-corners" aria-hidden />}
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {phase === 'camera' && <button type="button" className="face-capture-btn" onClick={capture} aria-label="Verificar"><Camera className="h-5 w-5" /></button>}
          {phase === 'review' && (
            <>
              <button type="button" className="face-btn ghost" onClick={retry}><RefreshCw className="h-4 w-4" /> Repetir</button>
              <button type="button" className="face-btn primary" onClick={verify}><CheckCircle2 className="h-4 w-4" /> Confirmar {action === 'clock_in' ? 'entrada' : 'saída'}</button>
            </>
          )}
          {phase === 'verifying' && <span className="face-verifying">A analisar…</span>}
          {phase === 'error' && <button type="button" className="face-btn primary" onClick={retry}><RefreshCw className="h-4 w-4" /> Tentar de novo</button>}
          {phase === 'success' && <button type="button" className="face-btn primary" onClick={finish}><CheckCircle2 className="h-4 w-4" /> Concluir</button>}
        </div>
      </div>
    </div>
  )
}
