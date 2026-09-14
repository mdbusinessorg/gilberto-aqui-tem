import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function Logo({ className, light, compact }: { className?: string; light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className={cn('inline-flex items-center shrink-0', className)} aria-label="Gilberto Aqui Tem — início">
      <Image src="/brand/logo.png" alt="Gilberto Aqui Tem — Telemóvel & Acessórios" width={190} height={90} priority className={cn('h-9 w-auto object-contain', light && 'brightness-0 invert', compact && 'h-8')} />
    </Link>
  )
}

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
