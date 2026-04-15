import { db } from '@/lib/insforge'
import Navbar from '@/components/Navbar'
import VehiclesClient, { type Vehicle } from '@/components/VehiclesClient'

async function getAllVehicles(): Promise<Vehicle[]> {
  const { data, error } = await db
    .from('vehicles')
    .select('id, name, brand, category, price_per_hour, price_per_day, available')
    .eq('available', true)
    .order('price_per_hour', { ascending: true })

  if (error || !data) return []
  return data as Vehicle[]
}

export default async function VehiclesPage() {
  const vehicles = await getAllVehicles()

  return (
    <main style={{ backgroundColor: '#0A0A0A', minHeight: '100vh' }}>
      <Navbar />

      {/* Page header */}
      <div
        style={{
          paddingTop: '64px', // offset for fixed navbar
          background: 'linear-gradient(to bottom, #0f0f0f, #0A0A0A)',
          borderBottom: '1px solid rgba(212,175,55,0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '4rem 2rem 3rem',
          }}
        >
          {/* Eyebrow */}
          <p
            style={{
              color: '#D4AF37',
              fontSize: '0.7rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              fontWeight: 500,
            }}
          >
            Pradini Fleet
          </p>

          {/* Title */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: '#D4AF37',
              marginBottom: '0.75rem',
              lineHeight: 1.1,
            }}
          >
            Our Fleet
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '36rem',
              lineHeight: 1.6,
            }}
          >
            Choose your perfect luxury vehicle — each one maintained to the highest standard for an exceptional Lagos journey.
          </p>
        </div>
      </div>

      {/* Vehicles grid with filters */}
      <div
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '3rem 2rem 6rem',
        }}
      >
        <VehiclesClient vehicles={vehicles} />
      </div>
    </main>
  )
}
