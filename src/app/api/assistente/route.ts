import { NextResponse } from 'next/server'
import { createClient, getSessionProfile } from '@/lib/supabase/server'
import { isAdminRole } from '@/lib/labels'
import { getMetrics } from '@/lib/metrics'

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

  const metrics = await getMetrics()
  const metricIds = Object.keys(metrics)
  const { data: popRows } = metricIds.length
    ? await supabase.from('products').select('id,name').in('id', metricIds)
    : { data: [] as { id: string; name: string | null }[] }
  const popularidade = (popRows ?? [])
    .map(x => ({ produto: x.name, vistas: metrics[x.id]?.views ?? 0, favoritos: metrics[x.id]?.favs ?? 0 }))
    .filter(x => x.vistas > 0 || x.favoritos > 0)
    .sort((a, b) => (b.vistas + b.favoritos * 3) - (a.vistas + a.favoritos * 3))
    .slice(0, 10)
  const ctxFull = { ...(ctx as object ?? {}), popularidade_loja: popularidade }

  const system = `És o assistente pessoal do administrador da loja GILBERTO AQUI TEM (Telemóvel & Acessórios, Luanda, Angola).
Estás numa chamada de voz com ele: fala português de Angola, natural e caloroso, como numa conversa ao telefone — frases curtas (1 a 4), sem listas, sem markdown, sem dizer que és um modelo de IA.
Valores em Kwanza (Kz). Responde apenas com base nos dados abaixo; se não souber, diz que não tens esse dado.
Podes: resumir vendas, pedidos, stock, movimentos do armazém, pontualidade e atrasos dos colegas, tarefas, trocas, e a popularidade dos produtos na loja (visualizações e favoritos — campo popularidade_loja; usa-o quando perguntarem o que 'bomba' ou o que os clientes mais vêm).
ACÇÕES que executas (termina a resposta com o comando exacto, numa linha própria):
- Marcar reunião/tarefa: REUNIAO|<titulo>|<AAAA-MM-DD>|<HH:MM>
- Abrir uma página do painel quando o administrador pedir "abre/vai para/mostra": IR|<caminho> — caminhos: /admin, /admin/pedidos, /admin/produtos, /admin/armazem, /admin/clientes, /admin/funcionarios, /admin/pontualidade, /admin/tarefas, /admin/promocoes, /admin/compras, /admin/fornecedores, /admin/trocas, /admin/relatorios, /admin/auditoria, /admin/avaliacoes, /admin/notificacoes, /admin/definicoes
Confirma sempre a acção em linguagem natural antes do comando (ex.: "A abrir os pedidos de hoje.").
Dados actuais (JSON): ${JSON.stringify(ctxFull)}`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai/gpt-oss-120b', temperature: 0.3, max_tokens: 1200, reasoning_effort: 'low', messages: [{ role: 'system', content: system }, ...history] }),
  })
  if (!res.ok) return NextResponse.json({ error: `Groq: ${res.status}` }, { status: 502 })
  const json = await res.json() as { choices?: { message?: { content?: string } }[] }
  let reply = json.choices?.[0]?.message?.content?.trim() ?? 'Não consegui responder.'

  let navigate: string | null = null
  const nav = reply.match(/IR\|(\/admin\/[a-z-]+)/)
  if (nav) { navigate = nav[1]; reply = reply.replace(nav[0], '').trim() }

  const m = reply.match(/REUNIAO\|([^|\n]+)\|(\d{4}-\d{2}-\d{2})\|(\d{2}:\d{2})/)
  let meeting: { title: string; at: string } | null = null
  if (m) {
    reply = reply.replace(m[0], '').trim()
    const at = `${m[2]}T${m[3]}:00`
    const { error: tErr } = await supabase.from('tasks').insert({ title: `Reunião: ${m[1].trim()}`, description: `Marcada pelo assistente para ${m[2]} às ${m[3]}.`, deadline: m[2], priority: 'alta', created_by: user.id })
    if (!tErr) meeting = { title: m[1].trim(), at }
  }
  return NextResponse.json({ reply, meeting, navigate })
}
