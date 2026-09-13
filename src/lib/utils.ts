import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKz(value: number | string | null | undefined, opts: { compact?: boolean } = {}) {
  const n = Number(value ?? 0)
  if (opts.compact && Math.abs(n) >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString('pt-PT', { maximumFractionDigits: 1 })}M Kz`
  }
  return `${n.toLocaleString('pt-PT', { maximumFractionDigits: 0 })} Kz`
}

export function formatNumber(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString('pt-PT', { maximumFractionDigits: 0 })
}

export function formatDate(value: string | Date | null | undefined, pattern = 'dd/MM/yyyy') {
  if (!value) return '—'
  return format(new Date(value), pattern, { locale: pt })
}

export function formatDateTime(value: string | Date | null | undefined) {
  return formatDate(value, "dd/MM/yyyy 'às' HH:mm")
}

export function formatTime(value: string | Date | null | undefined) {
  return formatDate(value, 'HH:mm')
}

export function timeAgo(value: string | Date | null | undefined) {
  if (!value) return ''
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: pt })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function daysAgoISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function initials(name: string | null | undefined) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function minutesToHours(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h${m ? ` ${m}m` : ''}`
}

export function percent(actual: number, target: number) {
  if (!target) return 0
  return Math.round((actual / target) * 1000) / 10
}

export function toNumber(v: FormDataEntryValue | null | undefined, fallback = 0) {
  if (v === null || v === undefined || v === '') return fallback
  const n = Number(String(v).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : fallback
}

export function toStr(v: FormDataEntryValue | null | undefined) {
  const s = v === null || v === undefined ? '' : String(v).trim()
  return s === '' ? null : s
}
