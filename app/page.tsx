import { db } from '@/lib/insforge'
import Navbar from '@/components/Navbar'
import VehicleCard from '@/components/VehicleCard'

// ─── Types ─────────────────────────────────────────────────────────────────

interface Vehicle {
  id: string
  name: string
  brand: string
  category: string
  price_per_hour: number
  available: boolean
}

interface Driver {
  id: string
  name: string
  rating: number
  experience_years: number
}

// ─── Data fetching ──────────────────────────────────────────────────────────

async function getVehicles(): Promise<Vehicle[]> {
  const { data, error } = await db
    .from('vehicles')
    .select('id, name, brand, category, price_per_hour, available')
    .eq('available', true)
    .limit(6)

  if (error || !data) return []
  return data as Vehicle[]
}

async function getDrivers(): Promise<Driver[]> {
  const { data, error } = await db
    .from('drivers')
    .select('id, name, rating, experience_years')
    .eq('available', true)
    .limit(3)

  if (error || !data) return []
  return data as Driver[]
}

// ─── Server-only components (no interactivity needed) ──────────────────────

function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0A0A0A',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '900px',
            height: '900px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            'linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 1.5rem', maxWidth: '56rem', margin: '0 auto' }}>
        <p
          style={{
            color: '#D4AF37',
            fontSize: '0.7rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          Lagos ∙ Premium Chauffeur
        </p>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
          }}
        >
          {"Lagos's Premier "}
          <span style={{ color: '#D4AF37' }}>Chauffeur</span>
          {' Experience'}
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '36rem',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}
        >
          Premium vehicles. Professional drivers. Unforgettable journeys.
        </p>

        <a
          href="#vehicles"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 2rem',
            backgroundColor: '#D4AF37',
            color: '#0A0A0A',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderRadius: '4px',
            boxShadow: '0 8px 32px rgba(212,175,55,0.2)',
          }}
        >
          Explore Vehicles
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      {/* Bottom fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '8rem',
          background: 'linear-gradient(to top, #0A0A0A, transparent)',
        }}
      />
    </section>
  )
}

function VehiclesSection({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <section id="vehicles" style={{ padding: '6rem 0', backgroundColor: '#0A0A0A' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ color: '#D4AF37', fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 500 }}>
            Our Fleet
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Featured Vehicles
          </h2>
          <div style={{ width: '4rem', height: '2px', backgroundColor: '#D4AF37', margin: '0 auto' }} />
        </div>

        {vehicles.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No vehicles available at this time.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                id={vehicle.id}
                name={vehicle.name}
                brand={vehicle.brand}
                category={vehicle.category}
                price_per_hour={vehicle.price_per_hour}
                bookHref={`/book/${vehicle.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      title: 'Choose Vehicle',
      description: 'Browse our curated fleet of premium vehicles and select the one that fits your occasion.',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
    },
    {
      title: 'Pick Date & Driver',
      description: 'Select your preferred date, time, and one of our professional vetted chauffeurs.',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      title: 'Enjoy the Ride',
      description: 'Sit back and experience Lagos in absolute comfort and style, door to door.',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
  ]

  return (
    <section id="how-it-works" style={{ padding: '6rem 0', backgroundColor: '#0D0D0D' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ color: '#D4AF37', fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 500 }}>
            Simple Process
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            How It Works
          </h2>
          <div style={{ width: '4rem', height: '2px', backgroundColor: '#D4AF37', margin: '0 auto' }} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}
        >
          {steps.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: '#111111',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              {/* Icon circle with number badge */}
              <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '2px solid rgba(212,175,55,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0A0A0A',
                    color: '#D4AF37',
                  }}
                >
                  {step.icon}
                </div>
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#D4AF37',
                    color: '#0A0A0A',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {idx + 1}
                </span>
              </div>
              <h3 style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.75rem' }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.6 }}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  const empty = 5 - full - (hasHalf ? 1 : 0)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width="16" height="16" fill="#D4AF37" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
      {hasHalf && (
        <svg width="16" height="16" fill="#D4AF37" viewBox="0 0 24 24">
          <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27V2l2.81 6.62z" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width="16" height="16" fill="rgba(255,255,255,0.2)" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  )
}

function DriversSection({ drivers }: { drivers: Driver[] }) {
  return (
    <section id="drivers" style={{ padding: '6rem 0', backgroundColor: '#0A0A0A' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ color: '#D4AF37', fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 500 }}>
            Expert Chauffeurs
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Meet Our Drivers
          </h2>
          <div style={{ width: '4rem', height: '2px', backgroundColor: '#D4AF37', margin: '0 auto' }} />
        </div>

        {drivers.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No drivers available at this time.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.5rem',
              maxWidth: '56rem',
              margin: '0 auto',
            }}
          >
            {drivers.map((driver) => (
              <div
                key={driver.id}
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.1))',
                    border: '2px solid rgba(212,175,55,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <svg width="40" height="40" fill="rgba(212,175,55,0.6)" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>

                <h3 style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                  {driver.name}
                </h3>

                <StarRating rating={driver.rating} />
                <p style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 500, marginTop: '4px' }}>
                  {Number(driver.rating).toFixed(1)} / 5.0
                </p>

                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    width: '100%',
                  }}
                >
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    Experience
                  </p>
                  <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.25rem', marginTop: '4px' }}>
                    {driver.experience_years}{' '}
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', fontWeight: 400 }}>
                      {driver.experience_years === 1 ? 'year' : 'years'}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#080808',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '3rem 0',
      }}
    >
      <div
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.2em', color: '#D4AF37', textTransform: 'uppercase' }}>
          Pradini
        </span>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
          Premium Mobility in Lagos
        </p>
        <div style={{ width: '2rem', height: '1px', backgroundColor: 'rgba(212,175,55,0.3)', margin: '4px 0' }} />
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>© 2026 Pradini. All rights reserved.</p>
      </div>
    </footer>
  )
}

// ─── Page (Server Component) ────────────────────────────────────────────────

export default async function HomePage() {
  const [vehicles, drivers] = await Promise.all([getVehicles(), getDrivers()])

  return (
    <main style={{ backgroundColor: '#0A0A0A', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <VehiclesSection vehicles={vehicles} />
      <HowItWorksSection />
      <DriversSection drivers={drivers} />
      <Footer />
    </main>
  )
}
