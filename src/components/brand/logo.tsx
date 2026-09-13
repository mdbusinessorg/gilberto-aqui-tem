import Link from 'next/link'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#1546B8" />
      <path d="M9 17.5 11.2 11h17.6L31 17.5c0 1.7-1.3 3-3 3s-3-1.3-3-3c0 1.7-1.3 3-3 3s-3-1.3-3-3c0 1.7-1.3 3-3 3s-3-1.3-3-3c0 1.7-1.3 3-3 3s-3-1.3-3-3Z" fill="#fff" />
      <path d="M12 21.8V30h16v-8.2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <rect x="17" y="24" width="6" height="6" rx="1" fill="#fff" />
    </svg>
  )
}

export function Logo({ className, light, compact }: { className?: string; light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className={cn('inline-flex items-center gap-2.5', className)} aria-label="Gilberto Aqui Tem — início">
      <LogoMark />
      {!compact && (
        <span className="leading-none">
          <span className={cn('block text-[15px] font-bold tracking-tight uppercase', light ? 'text-white' : 'text-brand-800')}>Gilberto Aqui Tem</span>
          <span className={cn('block text-[10.5px] font-medium tracking-wide mt-0.5', light ? 'text-brand-200' : 'text-ink-muted')}>Telemóvel &amp; Acessórios</span>
        </span>
      )}
    </Link>
  )
}
