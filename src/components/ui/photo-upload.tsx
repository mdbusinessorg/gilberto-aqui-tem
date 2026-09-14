'use client'
import * as React from 'react'
import Image from 'next/image'
import { Button, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

type Props = {
  bucket: 'products' | 'trade-ins'
  photos: string[]
  onChange: (photos: string[]) => void
  uploading: boolean
  onUploadingChange: (uploading: boolean) => void
  disabled?: boolean
}

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
}

export function PhotoUpload({ bucket, photos, onChange, uploading, onUploadingChange, disabled }: Props) {
  const [error, setError] = React.useState('')
  const inputId = React.useId()
  const busy = disabled || uploading

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    setError('')
    if (!files.length || busy) return
    if (photos.length + files.length > 6) { setError('Podes adicionar até 6 fotografias.'); return }
    if (files.some((file) => !extensions[file.type] || file.size === 0 || file.size > 5 * 1024 * 1024)) {
      setError('Escolhe imagens JPG, PNG ou WebP até 5 MB cada.')
      return
    }
    onUploadingChange(true)
    const next = [...photos]
    try {
      const storage = createClient().storage.from(bucket)
      for (const file of files) {
        const path = `${crypto.randomUUID()}.${extensions[file.type]}`
        const { error: uploadError } = await storage.upload(path, file, { contentType: file.type, upsert: false })
        if (uploadError) throw uploadError
        next.push(storage.getPublicUrl(path).data.publicUrl)
        onChange([...next])
      }
    } catch {
      setError('Não foi possível enviar todas as fotos. As enviadas foram mantidas; tenta novamente com as restantes.')
    } finally {
      onUploadingChange(false)
    }
  }

  return (
    <div className="space-y-3">
      <label htmlFor={inputId} className="block text-[13px] font-medium text-ink-soft">Fotografias</label>
      <Input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" multiple
        disabled={busy || photos.length >= 6} onChange={upload} className="h-auto py-2" />
      <p className="text-xs text-ink-muted">Até 6 fotografias, em JPG, PNG ou WebP, até 5 MB cada. Guarda o formulário para confirmar.</p>
      {uploading && <p role="status" className="text-sm text-brand-600">A enviar fotografias…</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {photos.map((url, index) => (
          <div key={url} className="w-24 space-y-1">
            <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir fotografia ${index + 1}`}>
              <Image src={url} alt={`Fotografia ${index + 1}`} width={96} height={96} unoptimized
                className="h-24 w-24 rounded border border-line bg-surface object-contain" />
            </a>
            {bucket === 'products' && index === 0 && <p className="text-xs text-ink-muted">Principal</p>}
            <Button type="button" size="sm" variant="outline" disabled={busy}
              aria-label={`Remover fotografia ${index + 1}`}
              onClick={() => onChange(photos.filter((_, i) => i !== index))}>Remover</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
