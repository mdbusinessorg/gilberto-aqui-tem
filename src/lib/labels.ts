import type { Database } from '@/lib/supabase/database.types'

type Enums = Database['public']['Enums']
export type UserRole = Enums['user_role']
export type OrderStatus = Enums['order_status']
export type PaymentStatus = Enums['payment_status']
export type TradeStatus = Enums['trade_status']
export type ReviewStatus = Enums['review_status']
export type WorkStatus = Enums['work_status']
export type Priority = Enums['priority_level']
export type PoStatus = Enums['po_status']
export type ReturnStatus = Enums['return_status']
export type MovementType = Enums['movement_type']
export type ProductCondition = Enums['product_condition']
export type AttendanceStatus = Enums['attendance_status']
export type LoyaltyTier = Enums['loyalty_tier']
export type OrderChannel = Enums['order_channel']

export type Tone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'slate'

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  manager: 'Gerente',
  sales: 'Vendas',
  warehouse: 'Armazém',
  customer_service: 'Apoio ao Cliente',
  marketing: 'Marketing',
  delivery: 'Entregas',
  technician: 'Técnico',
  customer: 'Cliente',
}
export const STAFF_ROLES: UserRole[] = ['super_admin', 'admin', 'manager', 'sales', 'warehouse', 'customer_service', 'marketing', 'delivery', 'technician']

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  pendente: { label: 'Pendente', tone: 'amber' },
  confirmado: { label: 'Confirmado', tone: 'blue' },
  pago: { label: 'Pago', tone: 'green' },
  em_preparacao: { label: 'Em preparação', tone: 'blue' },
  enviado: { label: 'Enviado', tone: 'violet' },
  entregue: { label: 'Entregue', tone: 'green' },
  concluido: { label: 'Concluído', tone: 'green' },
  cancelado: { label: 'Cancelado', tone: 'red' },
  devolvido: { label: 'Devolvido', tone: 'slate' },
}
export const ORDER_FLOW: OrderStatus[] = ['pendente', 'confirmado', 'pago', 'em_preparacao', 'enviado', 'entregue', 'concluido']

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: Tone }> = {
  pendente: { label: 'Por pagar', tone: 'amber' },
  pago: { label: 'Pago', tone: 'green' },
  parcial: { label: 'Parcial', tone: 'blue' },
  reembolsado: { label: 'Reembolsado', tone: 'slate' },
}

export const CHANNEL_LABELS: Record<OrderChannel, string> = {
  website: 'Website',
  whatsapp: 'WhatsApp',
  loja: 'Loja física',
  manual: 'Manual',
}

export const TRADE_STATUS: Record<TradeStatus, { label: string; tone: Tone }> = {
  novo: { label: 'Novo', tone: 'amber' },
  em_avaliacao: { label: 'Em avaliação', tone: 'blue' },
  proposta_enviada: { label: 'Proposta enviada', tone: 'violet' },
  aceite: { label: 'Aceite', tone: 'green' },
  rejeitado: { label: 'Rejeitado', tone: 'red' },
  aparelho_recebido: { label: 'Aparelho recebido', tone: 'blue' },
  concluido: { label: 'Concluído', tone: 'green' },
}

export const REVIEW_STATUS: Record<ReviewStatus, { label: string; tone: Tone }> = {
  pendente: { label: 'Pendente', tone: 'amber' },
  aprovada: { label: 'Aprovada', tone: 'green' },
  rejeitada: { label: 'Rejeitada', tone: 'red' },
  oculta: { label: 'Oculta', tone: 'slate' },
}

export const WORK_STATUS: Record<WorkStatus, { label: string; tone: Tone }> = {
  nao_iniciada: { label: 'Não iniciada', tone: 'slate' },
  em_progresso: { label: 'Em progresso', tone: 'blue' },
  concluida: { label: 'Concluída', tone: 'green' },
  atrasada: { label: 'Atrasada', tone: 'red' },
  cancelada: { label: 'Cancelada', tone: 'neutral' },
}

export const PRIORITY: Record<Priority, { label: string; tone: Tone }> = {
  baixa: { label: 'Baixa', tone: 'slate' },
  media: { label: 'Média', tone: 'blue' },
  alta: { label: 'Alta', tone: 'amber' },
  urgente: { label: 'Urgente', tone: 'red' },
}

export const PO_STATUS: Record<PoStatus, { label: string; tone: Tone }> = {
  rascunho: { label: 'Rascunho', tone: 'slate' },
  encomendado: { label: 'Encomendado', tone: 'blue' },
  parcialmente_recebido: { label: 'Parcialmente recebido', tone: 'amber' },
  recebido: { label: 'Recebido', tone: 'green' },
  cancelado: { label: 'Cancelado', tone: 'red' },
}

export const RETURN_STATUS: Record<ReturnStatus, { label: string; tone: Tone }> = {
  pendente: { label: 'Pendente', tone: 'amber' },
  aprovada: { label: 'Aprovada', tone: 'green' },
  rejeitada: { label: 'Rejeitada', tone: 'red' },
  concluida: { label: 'Concluída', tone: 'green' },
}

export const MOVEMENT_TYPES: Record<MovementType, { label: string; tone: Tone; direction: 'in' | 'out' | 'neutral' }> = {
  entrada: { label: 'Entrada', tone: 'green', direction: 'in' },
  saida: { label: 'Saída', tone: 'red', direction: 'out' },
  venda: { label: 'Venda', tone: 'blue', direction: 'out' },
  devolucao: { label: 'Devolução', tone: 'green', direction: 'in' },
  troca: { label: 'Troca', tone: 'violet', direction: 'out' },
  danificado: { label: 'Danificado', tone: 'red', direction: 'out' },
  perdido: { label: 'Perdido', tone: 'red', direction: 'out' },
  ajuste: { label: 'Ajuste manual', tone: 'amber', direction: 'neutral' },
  transferencia: { label: 'Transferência', tone: 'slate', direction: 'neutral' },
}

export const CONDITION: Record<ProductCondition, { label: string; tone: Tone }> = {
  novo: { label: 'Novo', tone: 'green' },
  recondicionado: { label: 'Recondicionado', tone: 'blue' },
  usado: { label: 'Usado', tone: 'amber' },
}

export const ATTENDANCE_STATUS: Record<AttendanceStatus, { label: string; tone: Tone }> = {
  presente: { label: 'Presente', tone: 'green' },
  atrasado: { label: 'Atrasado', tone: 'amber' },
  ausente: { label: 'Ausente', tone: 'red' },
  justificado: { label: 'Justificado', tone: 'slate' },
}

export const TIER: Record<LoyaltyTier, { label: string; tone: Tone }> = {
  regular: { label: 'Regular', tone: 'slate' },
  silver: { label: 'Silver', tone: 'neutral' },
  gold: { label: 'Gold', tone: 'amber' },
  vip: { label: 'VIP', tone: 'violet' },
}

export const DEPARTMENTS = ['Direcção', 'Vendas', 'Armazém', 'Apoio ao Cliente', 'Marketing', 'Entregas', 'Técnico', 'Administrativo']

export const NOTIFICATION_KINDS: Record<string, string> = {
  stock: 'Stock',
  pedido: 'Pedidos',
  troca: 'Trocas',
  avaliacao: 'Avaliações',
  pontualidade: 'Pontualidade',
  tarefa: 'Tarefas',
  compra: 'Compras',
  chat: 'Mensagens',
  geral: 'Geral',
}

export function labelOf<T extends string>(map: Record<T, { label: string }>, key: T | null | undefined) {
  return key ? map[key]?.label ?? key : '—'
}
