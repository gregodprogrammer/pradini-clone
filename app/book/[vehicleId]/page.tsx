'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { db } from '@/lib/insforge'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Vehicle {
  id: string
  name: string
  brand: string
  category: string
  price_per_hour: number
  price_per_day: number
  image_url: string | null
}

interface Driver {
  id: string
  name: string
  rating: number
  experience_years: number
}

interface FormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_location: string
  pickup_date: string
  pickup_time: string
  duration_hours: number
  driver_id: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const VEHICLE_IMAGES: Record<string, string> = {
  'Range Rover Autobiography': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
  'Mercedes S-Class':          'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
  'Toyota LX570':              'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
  'Mercedes Sprinter':         'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
  'BMW 7 Series':              'https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=800&q=80',
  'Lexus LX600':               'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80',
}
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'

const CATEGORY_STYLES: Record<string, { background: string; color: string; border: string }> = {
  SUV:   { background: 'rgba(212,175,55,0.12)', color: '#D4AF37',          border: '1px solid rgba(212,175,55,0.35)' },
  Sedan: { background: 'rgba(59,130,246,0.12)', color: 'rgb(147,197,253)', border: '1px solid rgba(59,130,246,0.35)' },
  Van:   { background: 'rgba(168,85,247,0.12)', color: 'rgb(196,181,253)', border: '1px solid rgba(168,85,247,0.35)' },
}

const TODAY = new Date().toISOString().split('T')[0]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const empty = 5 - full
  return (
    <span style={{ display: 'inline-flex', gap: '1px' }}>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width="12" height="12" fill="#D4AF37" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width="12" height="12" fill="rgba(255,255,255,0.2)" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </span>
  )
}

// Shared input style
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem 1rem',
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.5)',
  marginBottom: '6px',
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const params = useParams()
  const vehicleId = params.vehicleId as string

  // Data
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Form
  const [form, setForm] = useState<FormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    pickup_location: '',
    pickup_date: '',
    pickup_time: '09:00',
    duration_hours: 2,
    driver_id: '',
  })

  // Submission
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)

  // ── Fetch vehicle + drivers ──────────────────────────────────────────────
 useEffect(() => {
    async function load() {
      try {
        const fetchData = Promise.all([
          db.from('vehicles').select('id, name, brand, category, price_per_hour, price_per_day, image_url').eq('id', vehicleId).single(),
          db.from('drivers').select('id, name, rating, experience_years').eq('available', true),
        ])

        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 8000)
        )

        const [{ data: vData, error: vErr }, { data: dData, error: dErr }] =
          await Promise.race([fetchData, timeout])

        if (vErr || !vData) {
          setNotFound(true)
        } else {
          setVehicle(vData as Vehicle)
        }

        if (!dErr && dData) {
          setDrivers(dData as Driver[])
        }
      } catch (err) {
        console.error('Booking page load error:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [vehicleId])

  // ── Derived ──────────────────────────────────────────────────────────────
  const totalPrice = vehicle ? form.duration_hours * vehicle.price_per_hour : 0

  // ── Handlers ─────────────────────────────────────────────────────────────
  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vehicle) return
    if (!form.driver_id) { setError('Please select a driver.'); return }

    setSubmitting(true)
    setError(null)

    const { data, error: insertErr } = await db
      .from('bookings')
      .insert([{
        vehicle_id:      vehicle.id,
        driver_id:       form.driver_id,
        customer_name:   form.customer_name,
        customer_email:  form.customer_email,
        customer_phone:  form.customer_phone,
        pickup_location: form.pickup_location,
        pickup_date:     form.pickup_date,
        pickup_time:     form.pickup_time,
        duration_hours:  form.duration_hours,
        total_price:     totalPrice,
        status:          'pending',
      }])
      .select('id')

    setSubmitting(false)

    if (insertErr || !data?.[0]) {
      setError('Something went wrong. Please try again.')
      return
    }

    setBookingId(data[0].id as string)
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ backgroundColor: '#0A0A0A', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '40px', height: '40px', border: '2px solid rgba(212,175,55,0.2)',
                borderTop: '2px solid #D4AF37', borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Loading vehicle…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </main>
    )
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (notFound || !vehicle) {
    return (
      <main style={{ backgroundColor: '#0A0A0A', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#D4AF37', fontSize: '3rem', marginBottom: '1rem' }}>404</p>
            <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Vehicle not found</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>This vehicle may no longer be available.</p>
            <a href="/vehicles" style={{ color: '#D4AF37', fontSize: '0.875rem', textDecoration: 'underline' }}>Browse all vehicles</a>
          </div>
        </div>
      </main>
    )
  }

  const imgSrc = VEHICLE_IMAGES[vehicle.name] ?? vehicle.image_url ?? FALLBACK_IMAGE
  const badgeStyle = CATEGORY_STYLES[vehicle.category] ?? { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }

  // ── Success ──────────────────────────────────────────────────────────────
  if (bookingId) {
    return (
      <main style={{ backgroundColor: '#0A0A0A', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#111111',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: '16px',
              padding: '3rem 2rem',
              textAlign: 'center',
            }}
          >
            {/* Checkmark */}
            <div
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.05))',
                border: '2px solid rgba(212,175,55,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Booking Confirmed! 🎉
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Your {vehicle.name} has been reserved. Our team will be in touch to confirm the details.
            </p>

            {/* Reference */}
            <div
              style={{
                backgroundColor: '#0A0A0A',
                border: '1px solid rgba(212,175,55,0.15)',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>
                Booking Reference
              </p>
              <p style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {bookingId}
              </p>
            </div>

            {/* Summary */}
            <div style={{ textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Vehicle', value: vehicle.name },
                { label: 'Total', value: `₦${totalPrice.toLocaleString()}` },
                { label: 'Pickup Date', value: form.pickup_date },
                { label: 'Duration', value: `${form.duration_hours} hours` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                  <span style={{ color: '#ffffff', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Paystack payment */}
            <div
              style={{
                backgroundColor: '#0A0A0A',
                border: '1px solid rgba(0,195,0,0.2)',
                borderRadius: '10px',
                padding: '1.25rem',
                marginBottom: '1rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '0.5rem',
                }}
              >
                Complete Your Payment
              </p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Secure your booking by paying{' '}
                <span style={{ color: '#D4AF37', fontWeight: 600 }}>₦{totalPrice.toLocaleString()}</span>{' '}
                via Paystack.
              </p>
              <button
                onClick={() => alert('Paystack payment integration ready - contact us to complete booking')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: '#00C300',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.06em',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {/* Paystack-style lock icon */}
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pay with Paystack
              </button>
            </div>

            <a
              href="/vehicles"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', padding: '0.85rem',
                backgroundColor: 'transparent',
                border: '1px solid rgba(212,175,55,0.25)',
                color: '#D4AF37',
                fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none', borderRadius: '6px',
              }}
            >
              Browse More Vehicles
            </a>
          </div>
        </div>
      </main>
    )
  }

  // ── Booking form ─────────────────────────────────────────────────────────
  return (
    <main style={{ backgroundColor: '#0A0A0A', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '64px' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

          {/* Back link */}
          <a
            href="/vehicles"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '2rem', letterSpacing: '0.05em' }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Vehicles
          </a>

          <style>{`
            .booking-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: start; }
            @media (min-width: 768px) { .booking-layout { grid-template-columns: minmax(0,1fr) minmax(0,1fr); } }
            .form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }
            @media (min-width: 500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }
          `}</style>
          <div className="booking-layout">

            {/* ── Left column: vehicle summary ──────────────────────────── */}
            <div style={{ position: 'sticky', top: '88px' }}>

              {/* Vehicle image */}
              <div style={{ position: 'relative', height: '240px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <Image src={imgSrc} alt={vehicle.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', ...badgeStyle }}>
                    {vehicle.category}
                  </span>
                </div>
              </div>

              {/* Vehicle info */}
              <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
                <p style={{ fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.7)', marginBottom: '4px' }}>
                  {vehicle.brand}
                </p>
                <h1 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.4rem', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                  {vehicle.name}
                </h1>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1, backgroundColor: '#0A0A0A', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Per Hour</p>
                    <p style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1rem' }}>₦{Number(vehicle.price_per_hour).toLocaleString()}</p>
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#0A0A0A', borderRadius: '8px', padding: '0.85rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Per Day</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '1rem' }}>₦{Number(vehicle.price_per_day).toLocaleString()}</p>
                  </div>
                </div>

                {/* Live total */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))',
                    border: '1px solid rgba(212,175,55,0.25)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                  }}
                >
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '6px' }}>
                    Estimated Total
                  </p>
                  <p style={{ color: '#D4AF37', fontWeight: 800, fontSize: '2rem', lineHeight: 1 }}>
                    ₦{totalPrice.toLocaleString()}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '6px' }}>
                    {form.duration_hours} {form.duration_hours === 1 ? 'hour' : 'hours'} × ₦{Number(vehicle.price_per_hour).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right column: booking form ─────────────────────────────── */}
            <div>
              <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                Reserve Your Vehicle
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                Fill in your details and we'll confirm your booking promptly.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* ── Personal details ── */}
                <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ color: '#D4AF37', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Personal Details
                  </p>

                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Adebayo Johnson"
                      value={form.customer_name}
                      onChange={(e) => set('customer_name', e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div className="form-row-2">
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input
                        required
                        type="email"
                        placeholder="you@example.com"
                        value={form.customer_email}
                        onChange={(e) => set('customer_email', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone Number *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+234 800 000 0000"
                        value={form.customer_phone}
                        onChange={(e) => set('customer_phone', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Trip details ── */}
                <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ color: '#D4AF37', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Trip Details
                  </p>

                  <div>
                    <label style={labelStyle}>Pickup Location *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Victoria Island, Lagos"
                      value={form.pickup_location}
                      onChange={(e) => set('pickup_location', e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div className="form-row-2">
                    <div>
                      <label style={labelStyle}>Pickup Date *</label>
                      <input
                        required
                        type="date"
                        min={TODAY}
                        value={form.pickup_date}
                        onChange={(e) => set('pickup_date', e.target.value)}
                        style={{ ...inputStyle, colorScheme: 'dark' }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Pickup Time *</label>
                      <input
                        required
                        type="time"
                        value={form.pickup_time}
                        onChange={(e) => set('pickup_time', e.target.value)}
                        style={{ ...inputStyle, colorScheme: 'dark' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Duration (hours) *</label>
                    <input
                      required
                      type="number"
                      min={2}
                      max={24}
                      step={0.5}
                      value={form.duration_hours}
                      onChange={(e) => set('duration_hours', Number(e.target.value))}
                      style={inputStyle}
                    />
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>Minimum 2 hours</p>
                  </div>
                </div>

                {/* ── Driver selection ── */}
                <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
                  <p style={{ color: '#D4AF37', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    Select a Driver *
                  </p>

                  {drivers.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>No drivers available at this time.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {drivers.map((driver) => {
                        const isSelected = form.driver_id === driver.id
                        return (
                          <button
                            key={driver.id}
                            type="button"
                            onClick={() => set('driver_id', driver.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              padding: '0.9rem 1rem',
                              backgroundColor: isSelected ? 'rgba(212,175,55,0.08)' : '#0A0A0A',
                              border: isSelected ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.07)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%',
                              transition: 'all 0.15s',
                            }}
                          >
                            {/* Avatar */}
                            <div
                              style={{
                                width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                                background: isSelected ? 'linear-gradient(135deg, rgba(212,175,55,0.4), rgba(212,175,55,0.1))' : 'rgba(255,255,255,0.05)',
                                border: isSelected ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              <svg width="22" height="22" fill={isSelected ? '#D4AF37' : 'rgba(255,255,255,0.3)'} viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1 }}>
                              <p style={{ color: isSelected ? '#D4AF37' : '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '3px' }}>
                                {driver.name}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <StarRating rating={driver.rating} />
                                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                                  {Number(driver.rating).toFixed(1)} · {driver.experience_years} yrs experience
                                </span>
                              </div>
                            </div>

                            {/* Selected indicator */}
                            {isSelected && (
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={2.5} style={{ flexShrink: 0 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ── Error ── */}
                {error && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '6px',
                      color: 'rgb(252,165,165)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* ── Submit ── */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: submitting ? 'rgba(212,175,55,0.5)' : '#D4AF37',
                    color: '#0A0A0A',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {submitting ? (
                    <>
                      <div
                        style={{
                          width: '16px', height: '16px', border: '2px solid rgba(10,10,10,0.3)',
                          borderTop: '2px solid #0A0A0A', borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      Processing…
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </form>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
