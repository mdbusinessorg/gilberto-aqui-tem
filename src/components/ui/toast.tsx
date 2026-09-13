'use client'
import * as React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastKind = 'success' | 'error' | 'info'
type Toast = { id: number; kind: ToastKind; title: string; description?: string }
const ToastContext = React.createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const push = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { ...t, id }])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), t.kind === 'error' ? 6000 : 3500)
  }, [])
  const icons = { success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, error: <AlertCircle className="h-5 w-5 text-red-600" />, info: <Info className="h-5 w-5 text-brand-600" /> }
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:inset-x-auto">
        {toasts.map((t) => (
          <div key={t.id} className={cn('pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-line bg-white p-3.5 shadow-pop')}>
            {icons[t.kind]}
            <div className="flex-1 text-sm">
              <p className="font-medium text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-ink-muted">{t.description}</p>}
            </div>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast fora do ToastProvider')
  return {
    success: (title: string, description?: string) => ctx.push({ kind: 'success', title, description }),
    error: (title: string, description?: string) => ctx.push({ kind: 'error', title, description }),
    info: (title: string, description?: string) => ctx.push({ kind: 'info', title, description }),
  }
}
