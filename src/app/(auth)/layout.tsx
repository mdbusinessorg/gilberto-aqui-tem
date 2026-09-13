import { Logo } from '@/components/brand/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10">
      <Logo className="mb-8" />
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 text-xs text-ink-muted">© {new Date().getFullYear()} Gilberto Aqui Tem</p>
    </div>
  )
}
