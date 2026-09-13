'use client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()
  return (
    <Button variant="outline" size="sm" onClick={async () => { await createClient().auth.signOut(); router.push('/'); router.refresh() }}>
      <LogOut className="h-4 w-4" /> Sair
    </Button>
  )
}
