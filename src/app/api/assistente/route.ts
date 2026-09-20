import { NextResponse } from 'next/server'
import { createClient, getSessionProfile } from '@/lib/supabase/server'
import { isAdminRole } from '@/lib/labels'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

type Msg = { role: 'user' | 'assistant'; content: string }

export async function POST(req: Request) {
  const { user, profile } = await getSessionProfile()
  if (!user || !profile || !isAdminRole(profile.role)) return NextResponse.json({ error: 'Apenas administradores' }, { status: 403 })
  const key = process.env.GROQ_API_KEY
  if (!key) return NextResponse.json({ error: 'GROQ_API_KEY não configurada' }, { status: 500 })

  const { messages } = (await req.json()) as { messages: Msg[] }
  const history = (messages ?? []).slice(-12).filter(m => m.content?.trim())
  if (!history.length) return NextResponse.json({ error: 'Sem pergunta' }, { status: 400 })

  const supabase = createClient()
  const { data: ctx, error } = await supabase.rpc('assistant_context')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const system = `És o assistente pessoal do administrador da loja GILBERTO AQUI TEM (Telemóvel & Acessórios, Luanda, Angola).
Falas português de Angola, de forma directa e curta (respostas para serem lidas em voz alta: 1 a 4 frases, sem listas longas nem markdown).
Valores em Kwanza (Kz). Responde apenas com base nos dados abaixo; se não souber, diz que não tens esse dado.
Podes: resumir vendas, pedidos, stock, movimentos do armazém, pontualidade e atrasos dos colegas, tarefas e trocas.
Quando o administrador pedir para marcar uma reunião, responde confirmando o assunto, data e hora e termina com a linha exacta: REUNIAO|<titulo>|<AAAA-MM-DD>|<HH:MM>
Dados actuais (JSON): ${JSON.stringify(ctx)}`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai/gpt-oss-120b', temperature: 0.3, max_tokens: 1200, reasoning_effort: 'low', messages: [{ role: 'system', content: system }, ...history] }),
  })
  if (!res.ok) return NextResponse.json({ error: `Groq: ${res.status}` }, { status: 502 })
  const json = await res.json() as { choices?: { message?: { content?: string } }[] }
  let reply = json.choices?.[0]?.message?.content?.trim() ?? 'Não consegui responder.'

  const m = reply.match(/REUNIAO\|([^|\n]+)\|(\d{4}-\d{2}-\d{2})\|(\d{2}:\d{2})/)
  let meeting: { title: string; at: string } | null = null
  if (m) {
    reply = reply.replace(m[0], '').trim()
    const at = `${m[2]}T${m[3]}:00`
    const { error: tErr } = await supabase.from('tasks').insert({ title: `Reunião: ${m[1].trim()}`, description: `Marcada pelo assistente para ${m[2]} às ${m[3]}.`, deadline: m[2], priority: 'alta', created_by: user.id })
    if (!tErr) meeting = { title: m[1].trim(), at }
  }
  return NextResponse.json({ reply, meeting })
}
