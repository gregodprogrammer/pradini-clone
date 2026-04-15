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

const VAN_IMAGE = 'https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=800'

async function main() {
  const { data, error } = await insforge.database
    .from('vehicles')
    .update({ image_url: VAN_IMAGE })
    .eq('category', 'Van')
    .select('id, name')

  if (error) {
    console.error('Error:', error)
    process.exit(1)
  }

  console.log(`Updated ${data?.length ?? 0} van vehicle(s):`)
  data?.forEach((v: { name: string }) => console.log(' ✓', v.name))
}

main().catch((err) => { console.error(err.message); process.exit(1) })
