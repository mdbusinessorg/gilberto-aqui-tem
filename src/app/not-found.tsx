import Link from '@/components/ui/navigation-link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <p className="text-sm font-semibold text-brand-700">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Página não encontrada</h1>
      <p className="mt-2 text-ink-muted">O conteúdo que procuras não existe ou foi movido.</p>
      <Link href="/" className="mt-6 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Voltar ao início</Link>
    </div>
  )
}
