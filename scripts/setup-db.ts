import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

const BASE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL
const API_KEY  = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY

if (!BASE_URL || !API_KEY) {
  console.error('Missing NEXT_PUBLIC_INSFORGE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY in .env.local')
  process.exit(1)
}

async function runSQL(label: string, sql: string) {
  const res = await fetch(`${BASE_URL}/api/database/advance/rawsql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`[${label}] HTTP ${res.status}: ${body}`)
  }

  const json = await res.json().catch(() => null)
  console.log(`✓ ${label}`, json ? '' : '')
  return json
}

const tables: { label: string; sql: string }[] = [
  {
    label: 'Create vehicles',
    sql: `
      CREATE TABLE IF NOT EXISTS vehicles (
        id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        name            TEXT        NOT NULL,
        brand           TEXT        NOT NULL,
        category        TEXT        NOT NULL CHECK (category IN ('SUV', 'Sedan', 'Van')),
        price_per_hour  NUMERIC(10,2) NOT NULL,
        price_per_day   NUMERIC(10,2) NOT NULL,
        description     TEXT,
        image_url       TEXT,
        available       BOOLEAN     NOT NULL DEFAULT true,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    label: 'Create drivers',
    sql: `
      CREATE TABLE IF NOT EXISTS drivers (
        id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        name             TEXT        NOT NULL,
        photo_url        TEXT,
        rating           NUMERIC(3,2),
        experience_years INTEGER,
        bio              TEXT,
        available        BOOLEAN     NOT NULL DEFAULT true
      );
    `,
  },
  {
    label: 'Create bookings',
    sql: `
      CREATE TABLE IF NOT EXISTS bookings (
        id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id       UUID        REFERENCES vehicles(id) ON DELETE SET NULL,
        driver_id        UUID        REFERENCES drivers(id)  ON DELETE SET NULL,
        customer_name    TEXT        NOT NULL,
        customer_email   TEXT        NOT NULL,
        customer_phone   TEXT        NOT NULL,
        pickup_location  TEXT        NOT NULL,
        pickup_date      DATE        NOT NULL,
        pickup_time      TIME        NOT NULL,
        duration_hours   NUMERIC(5,2) NOT NULL,
        total_price      NUMERIC(10,2) NOT NULL,
        status           TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'confirmed', 'completed')),
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
]

async function main() {
  console.log('Setting up Pradini database...\n')
  for (const { label, sql } of tables) {
    await runSQL(label, sql)
  }
  console.log('\nAll tables created successfully.')
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message)
  process.exit(1)
})
