// Aplica ficheiros SQL ao projecto Supabase via Management API.
// Uso: SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... node scripts/db-apply.mjs supabase/migrations/0001_schema.sql [...]
import { readFileSync } from 'node:fs'

const token = process.env.SUPABASE_ACCESS_TOKEN
const ref = process.env.SUPABASE_PROJECT_REF || 'hfwshixqfhrnxwtixoqr'
if (!token) { console.error('SUPABASE_ACCESS_TOKEN em falta'); process.exit(1) }

for (const file of process.argv.slice(2)) {
  const query = readFileSync(file, 'utf8')
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const text = await res.text()
  if (!res.ok) { console.error(`✗ ${file}\n${text}`); process.exit(1) }
  console.log(`✓ ${file}`, text.length > 2 ? text.slice(0, 400) : '')
}
