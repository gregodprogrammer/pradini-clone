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
  { name: 'Range Rover Autobiography', image_url: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800' },
  { name: 'Toyota LX570',              image_url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800' },
  { name: 'Lexus LX600',              image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800' },
  { name: 'Mercedes S-Class',          image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800' },
  { name: 'BMW 7 Series',              image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800' },
  { name: 'Mercedes Sprinter',         image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800' },
]

async function main() {
  console.log('Updating vehicle images...\n')

  for (const { name, image_url } of updates) {
    const { data, error } = await insforge.database
      .from('vehicles')
      .update({ image_url })
      .eq('name', name)
      .select('id, name')

    if (error) {
      console.error(`✗ ${name}:`, error)
    } else if (!data || data.length === 0) {
      console.warn(`⚠ ${name}: no row found`)
    } else {
      console.log(`✓ ${name}`)
    }
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('\nFailed:', err.message)
  process.exit(1)
})
