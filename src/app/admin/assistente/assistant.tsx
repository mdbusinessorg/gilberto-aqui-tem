'use client'
import * as React from 'react'
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'

type Msg = { role: 'user' | 'assistant'; content: string }
type Rec = { start: () => void; stop: () => void; lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null }
type RecCtor = new () => Rec

const SUGGESTIONS = ['Como estão as vendas de hoje?', 'Quem chegou atrasado esta semana?', 'Que produtos estão com stock baixo?', 'Resume os últimos movimentos do armazém', 'Marca uma reunião de equipa amanhã às 9h']

export function VoiceAssistant({ adminName }: { adminName: string }) {
  const [messages, setMessages] = React.useState<Msg[]>([{ role: 'assistant', content: `Olá ${adminName}. Pergunta-me sobre vendas, pedidos, stock, armazém, pontualidade dos colegas ou pede para marcar uma reunião.` }])
  const [input, setInput] = React.useState('')
  const [listening, setListening] = React.useState(false)
  const [speak, setSpeak] = React.useState(true)
  const [busy, setBusy] = React.useState(false)
  const recRef = React.useRef<Rec | null>(null)
  const endRef = React.useRef<HTMLDivElement>(null)
  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const say = (text: string) => {
    if (!speak || typeof speechSynthesis === 'undefined') return
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text); u.lang = 'pt-PT'; u.rate = 1.02
    const v = speechSynthesis.getVoices().find(v => v.lang.startsWith('pt'))
    if (v) u.voice = v
    speechSynthesis.speak(u)
  }

  const ask = async (text: string) => {
    const q = text.trim(); if (!q || busy) return
    const next: Msg[] = [...messages, { role: 'user', content: q }]
    setMessages(next); setInput(''); setBusy(true)
    try {
      const res = await fetch('/api/assistente', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.slice(1) }) })
      const data = await res.json() as { reply?: string; error?: string; meeting?: { title: string; at: string } | null }
      const reply = data.reply ?? `Erro: ${data.error ?? res.status}`
      const full = data.meeting ? `${reply} (Reunião "${data.meeting.title}" registada em Tarefas.)` : reply
      setMessages(m => [...m, { role: 'assistant', content: full }]); say(reply)
    } catch { setMessages(m => [...m, { role: 'assistant', content: 'Sem ligação ao assistente.' }]) }
    setBusy(false)
  }

  const toggleMic = () => {
    if (listening) { recRef.current?.stop(); setListening(false); return }
    const Ctor = ((window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: RecCtor }).webkitSpeechRecognition)
    if (!Ctor) return
    const rec = new Ctor(); rec.lang = 'pt-PT'; rec.interimResults = true; rec.continuous = false
    let finalText = ''
    rec.onresult = (e) => { finalText = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript).join(' '); setInput(finalText) }
    rec.onend = () => { setListening(false); if (finalText.trim()) void ask(finalText) }
    rec.onerror = () => setListening(false)
    recRef.current = rec; speechSynthesis?.cancel(); rec.start(); setListening(true)
  }

  return (
    <div className="va">
      <div className="va-log">
        {messages.map((m, i) => <div key={i} className={`va-msg ${m.role}`}>{m.role === 'assistant' && <Sparkles className="h-3.5 w-3.5" />}<p>{m.content}</p></div>)}
        {busy && <div className="va-msg assistant"><Sparkles className="h-3.5 w-3.5" /><p className="va-typing">A consultar os dados da loja…</p></div>}
        <div ref={endRef} />
      </div>
      <div className="va-suggest">{SUGGESTIONS.map(s => <button key={s} type="button" onClick={() => ask(s)} disabled={busy}>{s}</button>)}</div>
      <form className="va-bar" onSubmit={e => { e.preventDefault(); void ask(input) }}>
        <button type="button" className={`va-mic ${listening ? 'on' : ''}`} onClick={toggleMic} disabled={!supported} title={supported ? 'Falar' : 'Reconhecimento de voz indisponível neste navegador'} aria-label="Falar">
          {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder={listening ? 'A ouvir…' : 'Escreve ou fala com o assistente'} />
        <button type="button" className="va-icon" onClick={() => { setSpeak(s => !s); speechSynthesis?.cancel() }} aria-label="Voz" title={speak ? 'Desligar voz' : 'Ligar voz'}>{speak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
        <Button type="submit" size="sm" loading={busy} disabled={!input.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  )
}
