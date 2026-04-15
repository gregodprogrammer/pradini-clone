import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@insforge/sdk'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) dotenv.config({ path: envPath })
else dotenv.config()

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
})

const updates: { name: string; image_url: string }[] = [
  {
    name: 'Mercedes Sprinter',
    image_url: 'https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?w=800',
  },
]

const VAN_FALLBACK = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800'

async function main() {
  console.log('Updating Van vehicle images...\n')

  // Apply name-specific updates
  for (const { name, image_url } of updates) {
    const { data, error } = await insforge.database
      .from('vehicles')
      .update({ image_url })
      .eq('name', name)
      .select('id, name, category')

    if (error) {
      console.error(`✗ ${name}:`, error)
    } else if (!data || data.length === 0) {
      console.warn(`⚠ ${name}: no row found`)
    } else {
      console.log(`✓ ${name} → specific image`)
    }
  }

  // Apply fallback to any remaining Van vehicles not already updated
  const updatedNames = updates.map((u) => u.name)
  const { data: vans, error: fetchErr } = await insforge.database
    .from('vehicles')
    .select('id, name')
    .eq('category', 'Van')

  if (fetchErr) {
    console.error('✗ Failed to fetch Van vehicles:', fetchErr)
    return
  }

  const remaining = (vans ?? []).filter((v: { name: string }) => !updatedNames.includes(v.name))

  if (remaining.length === 0) {
    console.log('\nNo other Van vehicles to update.')
  } else {
    for (const vehicle of remaining as { id: string; name: string }[]) {
      const { data, error } = await insforge.database
        .from('vehicles')
        .update({ image_url: VAN_FALLBACK })
        .eq('id', vehicle.id)
        .select('id, name')

      if (error) {
        console.error(`✗ ${vehicle.name}:`, error)
      } else {
        console.log(`✓ ${vehicle.name} → fallback van image`)
      }
    }
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('\nFailed:', err.message)
  process.exit(1)
})
