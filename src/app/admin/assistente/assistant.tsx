'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Phone, PhoneOff, Send, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'

type Msg = { role: 'user' | 'assistant'; content: string }
type RecResult = { isFinal: boolean; 0: { transcript: string } }
type RecEvent = { resultIndex: number; results: ArrayLike<RecResult> }
type Rec = { start: () => void; stop: () => void; abort: () => void; lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: RecEvent) => void) | null; onend: (() => void) | null; onerror: ((e: unknown) => void) | null }
type RecCtor = new () => Rec

const SUGGESTIONS = ['Como estão as vendas de hoje?', 'Quem chegou atrasado esta semana?', 'Que produtos estão com stock baixo?', 'Abre os pedidos de hoje', 'Marca uma reunião de equipa amanhã às 9h']

export function VoiceAssistant({ adminName }: { adminName: string }) {
  const router = useRouter()
  const [messages, setMessages] = React.useState<Msg[]>([{ role: 'assistant', content: `Olá ${adminName}. Toca no telefone para começar uma chamada comigo — falas, eu respondo e executo. Também podes escrever.` }])
  const [input, setInput] = React.useState('')
  const [call, setCall] = React.useState(false)
  const [speak, setSpeak] = React.useState(true)
  const [busy, setBusy] = React.useState(false)
  const [speaking, setSpeaking] = React.useState(false)
  const recRef = React.useRef<Rec | null>(null)
  const callRef = React.useRef(false)
  const speakingRef = React.useRef(false)
  const busyRef = React.useRef(false)
  const endRef = React.useRef<HTMLDivElement>(null)
  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  React.useEffect(() => () => { stopRec(); speechSynthesis?.cancel() }, [])

  const stopRec = () => { try { recRef.current?.abort() } catch { /* noop */ } recRef.current = null }

  const pickVoice = () => {
    const vs = speechSynthesis.getVoices()
    return vs.find(v => /pt-PT/i.test(v.lang) && /google|natural|online/i.test(v.name))
      ?? vs.find(v => /pt-PT/i.test(v.lang))
      ?? vs.find(v => v.lang.startsWith('pt'))
      ?? null
  }

  const say = (text: string, onend?: () => void) => {
    if (!speak || typeof speechSynthesis === 'undefined') { onend?.(); return }
    speechSynthesis.cancel(); speechSynthesis.resume()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pt-PT'; u.rate = 1.04; u.pitch = 1
    const v = pickVoice(); if (v) u.voice = v
    speakingRef.current = true; setSpeaking(true)
    u.onend = u.onerror = () => { speakingRef.current = false; setSpeaking(false); onend?.() }
    speechSynthesis.speak(u)
  }

  const listen = () => {
    if (!callRef.current || busyRef.current || speakingRef.current || recRef.current) return
    const Ctor = ((window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: RecCtor }).webkitSpeechRecognition)
    if (!Ctor) return
    const rec = new Ctor(); rec.lang = 'pt-PT'; rec.interimResults = true; rec.continuous = true
    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) {
          const t = r[0].transcript.trim()
          if (t) { setInput(''); void ask(t) }
        } else interim += r[0].transcript
      }
      if (interim) setInput(interim)
    }
    rec.onend = () => { recRef.current = null; if (callRef.current && !busyRef.current && !speakingRef.current) setTimeout(listen, 120) }
    rec.onerror = () => { recRef.current = null; if (callRef.current) setTimeout(listen, 400) }
    recRef.current = rec
    try { rec.start() } catch { recRef.current = null }
  }

  const ask = async (text: string) => {
    const q = text.trim(); if (!q || busyRef.current) return
    busyRef.current = true; setBusy(true)
    stopRec()
    const next: Msg[] = [...messages, { role: 'user', content: q }]
    setMessages(next); setInput('')
    try {
      const res = await fetch('/api/assistente', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.slice(1) }) })
      const data = await res.json() as { reply?: string; error?: string; meeting?: { title: string; at: string } | null; navigate?: string | null }
      const reply = data.reply ?? `Erro: ${data.error ?? res.status}`
      const full = data.meeting ? `${reply} (Reunião "${data.meeting.title}" registada em Tarefas.)` : reply
      setMessages(m => [...m, { role: 'assistant', content: full }])
      if (data.navigate) setTimeout(() => router.push(data.navigate as string), 1400)
      say(reply, () => { busyRef.current = false; setBusy(false); listen() })
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sem ligação ao assistente.' }])
      busyRef.current = false; setBusy(false); listen()
    }
  }

  const toggleCall = () => {
    if (call) {
      if (speakingRef.current) { speechSynthesis?.cancel(); return }
      callRef.current = false; setCall(false); stopRec(); speechSynthesis?.cancel()
      return
    }
    callRef.current = true; setCall(true); speechSynthesis?.cancel()
    say('Estou aqui. Podes falar.', listen)
  }

  const pushToTalk = () => {
    const Ctor = ((window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: RecCtor }).webkitSpeechRecognition)
    if (!Ctor) return
    const rec = new Ctor(); rec.lang = 'pt-PT'; rec.interimResults = true; rec.continuous = false
    let finalText = ''
    rec.onresult = (e) => { finalText = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript).join(' '); setInput(finalText) }
    rec.onend = () => { if (finalText.trim()) void ask(finalText) }
    rec.onerror = () => undefined
    speechSynthesis?.cancel(); try { rec.start() } catch { /* noop */ }
  }

  return (
    <div className="va">
      <div className="va-log">
        {messages.map((m, i) => <div key={i} className={`va-msg ${m.role}`}>{m.role === 'assistant' && <Sparkles className="h-3.5 w-3.5" />}<p>{m.content}</p></div>)}
        {busy && <div className="va-msg assistant"><Sparkles className="h-3.5 w-3.5" /><p className="va-typing">{speaking ? 'A falar — toca no telefone para interromper' : 'A pensar…'}</p></div>}
        <div ref={endRef} />
      </div>
      <div className="va-suggest">{SUGGESTIONS.map(s => <button key={s} type="button" onClick={() => ask(s)} disabled={busy}>{s}</button>)}</div>
      <form className="va-bar" onSubmit={e => { e.preventDefault(); void ask(input) }}>
        <button type="button" className={`va-mic ${call ? 'on' : ''}`} onClick={toggleCall} disabled={!supported} title={supported ? (call ? 'Toca para me interromper; toca de novo para terminar' : 'Chamada por voz') : 'Reconhecimento de voz indisponível neste navegador'} aria-label="Chamada por voz">
          {call ? <PhoneOff className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
        </button>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder={call ? 'Em chamada — fala naturalmente' : 'Escreve ou fala com o assistente'} />
        <button type="button" className="va-icon" onClick={pushToTalk} disabled={!supported || call} aria-label="Falar uma vez" title="Falar uma vez"><Mic className="h-4 w-4" /></button>
        <button type="button" className="va-icon" onClick={() => { setSpeak(s => !s); speechSynthesis?.cancel() }} aria-label="Voz" title={speak ? 'Desligar voz' : 'Ligar voz'}>{speak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
        <Button type="submit" size="sm" loading={busy} disabled={!input.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  )
}
