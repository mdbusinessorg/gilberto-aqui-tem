'use client'
import * as React from 'react'
import Link from '@/components/ui/navigation-link'
import { Loader2, X, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tone } from '@/lib/labels'

/* ------------------------------------------------------------------ Button */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'whatsapp' | 'dark'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-500',
  outline: 'border border-line bg-white text-ink hover:bg-surface focus-visible:ring-brand-500',
  ghost: 'text-ink-soft hover:bg-surface hover:text-ink focus-visible:ring-brand-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1fb857] focus-visible:ring-[#25D366]',
  dark: 'bg-ink text-white hover:bg-black focus-visible:ring-ink',
}
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-md',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-md',
  icon: 'h-9 w-9 rounded-md',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn('inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap', buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
})

export function ButtonLink({ href, className, variant = 'primary', size = 'md', children, ...props }: { href: string; variant?: ButtonVariant; size?: ButtonSize } & Omit<React.ComponentProps<typeof Link>, 'href'>) {
  return (
    <Link href={href} className={cn('inline-flex items-center justify-center font-medium transition-colors whitespace-nowrap', buttonVariants[variant], buttonSizes[size], className)} {...props}>
      {children}
    </Link>
  )
}

/* ------------------------------------------------------------------ Inputs */
const fieldBase = 'w-full rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-surface disabled:text-ink-muted'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(fieldBase, 'h-10', className)} {...props} />
})
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(fieldBase, 'py-2 min-h-[88px]', className)} {...props} />
})
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(fieldBase, 'h-10 pr-8 appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%236B7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat', className)} {...props}>
      {children}
    </select>
  )
})

export function Field({ label, hint, error, children, className, required }: { label?: string; hint?: string; error?: string; children: React.ReactNode; className?: string; required?: boolean }) {
  return (
    <label className={cn('block', className)}>
      {label && <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">{label}{required && <span className="text-red-500"> *</span>}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export function Checkbox({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  return (
    <label className={cn('inline-flex items-center gap-2 text-sm text-ink-soft cursor-pointer', className)}>
      <input type="checkbox" className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500" {...props} />
      {label}
    </label>
  )
}

/* ------------------------------------------------------------------ Badge */
const toneClasses: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700 ring-gray-200',
  blue: 'bg-brand-50 text-brand-700 ring-brand-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  red: 'bg-red-50 text-red-700 ring-red-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
}
export function Badge({ tone = 'neutral', children, className, dot }: { tone?: Tone; children: React.ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', toneClasses[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
export function StatusBadge<T extends string>({ map, value }: { map: Record<T, { label: string; tone: Tone }>; value: T | null | undefined }) {
  if (!value) return <span className="text-ink-muted">—</span>
  const m = map[value]
  return <Badge tone={m?.tone ?? 'neutral'}>{m?.label ?? value}</Badge>
}

/* ------------------------------------------------------------------ Card */
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('ui-card rounded-lg border border-line bg-white shadow-card', className)} {...props}>{children}</div>
}
export function CardHeader({ title, description, action, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-line px-5 py-4', className)}>
      <div>
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}

/* ------------------------------------------------------------------ Stat */
export function StatCard({ label, value, hint, icon, tone = 'neutral', href }: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: React.ReactNode; tone?: Tone; href?: string }) {
  const inner = (
    <Card className={cn('p-4 h-full', href && 'transition-colors hover:border-brand-200')}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-ink-muted">{label}</p>
        {icon && <span className={cn('rounded-md p-1.5', toneClasses[tone])}>{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </Card>
  )
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner
}

/* ------------------------------------------------------------------ Empty */
export function EmptyState({ title, description, action, icon, className, compact }: { title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode; className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'py-8' : 'py-16', className)}>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink-muted">{icon ?? <Inbox className="h-5 w-5" />}</div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ Table */
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  )
}
export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-surface/70 text-left text-xs font-medium uppercase tracking-wide text-ink-muted [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-medium">{children}</thead>
}
export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-line [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle [&_tr:hover]:bg-surface/50">{children}</tbody>
}

/* ------------------------------------------------------------------ Modal */
export function Modal({ open, onClose, title, description, children, size = 'md' }: { open: boolean; onClose: () => void; title: React.ReactNode; description?: React.ReactNode; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className={cn('relative w-full rounded-t-xl sm:rounded-lg bg-white shadow-pop max-h-[92vh] flex flex-col', sizes[size])}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-ink-muted hover:bg-surface hover:text-ink" aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirmar', danger, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description?: string; confirmLabel?: string; danger?: boolean; loading?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ Misc */
export function PageHeader({ title, description, actions, breadcrumb }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; breadcrumb?: React.ReactNode }) {
  return (
    <div className="page-heading mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumb && <div className="mb-1 text-xs text-ink-muted">{breadcrumb}</div>}
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-600', className)} />
}

export function Stars({ value, size = 'sm', className }: { value: number; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' }[size]
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={cn(s, i <= Math.round(value) ? 'text-amber-400' : 'text-gray-200')} fill="currentColor">
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.9l-5.3 2.8 1.1-5.9L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  )
}

export function Progress({ value, tone = 'blue', className }: { value: number; tone?: Tone; className?: string }) {
  const bar: Record<Tone, string> = { neutral: 'bg-gray-400', blue: 'bg-brand-500', green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500', violet: 'bg-violet-500', slate: 'bg-slate-400' }
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-gray-100', className)}>
      <div className={cn('h-full rounded-full transition-all', bar[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export function Tabs({ tabs, value, onChange }: { tabs: { value: string; label: string; count?: number }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button key={t.value} onClick={() => onChange(t.value)} className={cn('-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors', value === t.value ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-muted hover:text-ink')}>
          {t.label}{typeof t.count === 'number' && <span className="ml-1.5 rounded-full bg-surface px-1.5 py-0.5 text-xs text-ink-muted">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Alert({ tone = 'blue', children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-md px-3.5 py-2.5 text-sm ring-1 ring-inset', toneClasses[tone], className)}>{children}</div>
}
