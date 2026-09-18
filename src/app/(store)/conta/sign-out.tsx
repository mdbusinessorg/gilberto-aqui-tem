'use client'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  return (
    <Button variant="outline" size="sm" onClick={async () => { await createClient().auth.signOut(); window.location.assign('/') }}>
      <LogOut className="h-4 w-4" /> Sair
    </Button>
  )
}
