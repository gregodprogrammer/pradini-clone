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

const vehicles = [
  {
    name: 'Range Rover Autobiography',
    brand: 'Land Rover',
    category: 'SUV',
    price_per_hour: 45000,
    price_per_day: 280000,
    description: 'The pinnacle of luxury SUVs — commanding presence, hand-stitched leather cabin, and effortless performance on Lagos roads.',
    image_url: null,
    available: true,
  },
  {
    name: 'Mercedes S-Class',
    brand: 'Mercedes',
    category: 'Sedan',
    price_per_hour: 35000,
    price_per_day: 220000,
    description: 'The benchmark of executive sedans. Whisper-quiet ride, Burmester sound system, and first-class rear seating.',
    image_url: null,
    available: true,
  },
  {
    name: 'Toyota LX570',
    brand: 'Toyota',
    category: 'SUV',
    price_per_hour: 30000,
    price_per_day: 190000,
    description: 'Legendary reliability meets luxury. Spacious cabin, advanced four-wheel drive, and an imposing stance for any occasion.',
    image_url: null,
    available: true,
  },
  {
    name: 'Mercedes Sprinter',
    brand: 'Mercedes',
    category: 'Van',
    price_per_hour: 25000,
    price_per_day: 160000,
    description: 'Premium executive van ideal for group travel. Configured with VIP seating, ambient lighting, and tinted glass.',
    image_url: null,
    available: true,
  },
  {
    name: 'BMW 7 Series',
    brand: 'BMW',
    category: 'Sedan',
    price_per_hour: 38000,
    price_per_day: 240000,
    description: 'Sporty yet indulgent. The BMW 7 Series delivers dynamic handling with a lavishly appointed interior.',
    image_url: null,
    available: true,
  },
  {
    name: 'Lexus LX600',
    brand: 'Lexus',
    category: 'SUV',
    price_per_hour: 42000,
    price_per_day: 265000,
    description: 'Ultra-luxury SUV with a 4-seat VIP mode, Lexus Takumi craftsmanship, and commanding road presence.',
    image_url: null,
    available: true,
  },
]

const drivers = [
  {
    name: 'Emeka Okafor',
    photo_url: null,
    rating: 5.0,
    experience_years: 7,
    bio: 'Emeka is a seasoned chauffeur with 7 years serving Lagos\'s elite clientele. Fluent in English and Igbo, known for punctuality and discretion.',
    available: true,
  },
  {
    name: 'Tunde Adeyemi',
    photo_url: null,
    rating: 5.0,
    experience_years: 5,
    bio: 'Tunde brings 5 years of luxury transport experience with deep knowledge of Lagos routes and traffic patterns. Calm, professional, and courteous.',
    available: true,
  },
  {
    name: 'Chidi Nwosu',
    photo_url: null,
    rating: 5.0,
    experience_years: 3,
    bio: 'Chidi is a rising star in premium chauffeur services. Detail-oriented with a commitment to five-star passenger comfort on every journey.',
    available: true,
  },
]

async function seed() {
  console.log('Seeding Pradini database...\n')

  console.log('Inserting 6 vehicles...')
  const { data: vehicleData, error: vehicleError } = await insforge.database
    .from('vehicles')
    .insert(vehicles)
    .select('id, name')

  if (vehicleError) throw new Error(`Vehicles insert failed: ${JSON.stringify(vehicleError)}`)
  vehicleData?.forEach(v => console.log(`  ✓ ${v.name} (${v.id})`))

  console.log('\nInserting 3 drivers...')
  const { data: driverData, error: driverError } = await insforge.database
    .from('drivers')
    .insert(drivers)
    .select('id, name')

  if (driverError) throw new Error(`Drivers insert failed: ${JSON.stringify(driverError)}`)
  driverData?.forEach(d => console.log(`  ✓ ${d.name} (${d.id})`))

  console.log('\nSeed complete.')
}

seed().catch(err => {
  console.error('\nSeed failed:', err.message)
  process.exit(1)
})
