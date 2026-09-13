import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Gilberto Aqui Tem — Telemóvel & Acessórios', template: '%s · Gilberto Aqui Tem' },
  description: 'Telemóveis, laptops, PlayStation e acessórios em Angola. Compramos, vendemos e trocamos.',
  openGraph: { type: 'website', locale: 'pt_AO', siteName: 'Gilberto Aqui Tem' },
}
export const viewport: Viewport = { themeColor: '#1546B8', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO" className={inter.variable}>
      <body className="font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
