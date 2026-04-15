'use client'

import { useEffect, useState, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import { db } from '@/lib/insforge'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
  id: string
  customer_name: string
  customer_email: string
  pickup_date: string
  pickup_time: string
  duration_hours: number
  total_price: number
  status: 'pending' | 'confirmed' | 'completed'
  created_at: string
  vehicles?: { name: string; brand: string }[] | null
  drivers?: { name: string }[] | null
}

interface Stats {
  totalVehicles: number
  totalBookings: number
  pending: number
  confirmed: number
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string
  value: number
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <div
      style={{
        backgroundColor: '#111111',
        border: '1px solid rgba(212,175,55,0.15)',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
          border: '1px solid rgba(212,175,55,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#D4AF37',
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
          {label}
        </p>
        {loading ? (
          <div style={{ width: '2.5rem', height: '1.5rem', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ) : (
          <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.75rem', lineHeight: 1 }}>{value}</p>
        )}
      </div>
    </div>
  )
}

type StatusValue = 'pending' | 'confirmed' | 'completed'

function StatusBadge({ status }: { status: StatusValue }) {
  const styles: Record<StatusValue, { background: string; color: string; border: string }> = {
    pending:   { background: 'rgba(234,179,8,0.12)',  color: 'rgb(253,224,71)',   border: '1px solid rgba(234,179,8,0.35)'  },
    confirmed: { background: 'rgba(34,197,94,0.12)',  color: 'rgb(134,239,172)',  border: '1px solid rgba(34,197,94,0.35)'  },
    completed: { background: 'rgba(59,130,246,0.12)', color: 'rgb(147,197,253)',  border: '1px solid rgba(59,130,246,0.35)' },
  }
  const s = styles[status]
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', ...s }}>
      {status}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<Stats>({ totalVehicles: 0, totalBookings: 0, pending: 0, confirmed: 0 })
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [
      { data: bookingData, error: bookingErr },
      { count: vehicleCount, error: vehicleErr },
    ] = await Promise.all([
      db.from('bookings')
        .select('id, customer_name, customer_email, pickup_date, pickup_time, duration_hours, total_price, status, created_at, vehicles(name, brand), drivers(name)')
        .order('created_at', { ascending: false }),
      db.from('vehicles').select('id', { count: 'exact' }).limit(0),
    ])

    if (bookingErr || vehicleErr) {
      setError('Failed to load dashboard data. Please refresh.')
      setLoading(false)
      return
    }

    const rows = (bookingData ?? []) as any[]
    setBookings(rows)
    setStats({
      totalVehicles: vehicleCount ?? 0,
      totalBookings: rows.length,
      pending:   rows.filter((b) => b.status === 'pending').length,
      confirmed: rows.filter((b) => b.status === 'confirmed').length,
    })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function confirmBooking(id: string) {
    setConfirming(id)
    const { error: updateErr } = await db
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', id)

    if (updateErr) {
      setError('Failed to confirm booking. Please try again.')
    } else {
      // Optimistic update
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'confirmed' as const } : b))
      )
      setStats((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        confirmed: prev.confirmed + 1,
      }))
    }
    setConfirming(null)
  }

  const statCards = [
    {
      label: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      ),
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Confirmed',
      value: stats.confirmed,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <main style={{ backgroundColor: '#0A0A0A', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ paddingTop: '64px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '0.5rem', fontWeight: 500 }}>
              Dashboard
            </p>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#D4AF37', lineHeight: 1.1 }}>
              Pradini Admin
            </h1>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'rgb(252,165,165)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'rgb(252,165,165)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
            </div>
          )}

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {statCards.map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} loading={loading} />
            ))}
          </div>

          {/* Bookings table */}
          <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>

            {/* Table header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem', marginBottom: '2px' }}>Recent Bookings</h2>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                  {loading ? 'Loading…' : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} total`}
                </p>
              </div>
              <button
                onClick={load}
                disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 1rem', backgroundColor: 'transparent', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '6px', color: '#D4AF37', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {/* Table scroll wrapper */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Customer', 'Vehicle', 'Pickup Date', 'Duration', 'Total', 'Status', 'Action'].map((col) => (
                      <th
                        key={col}
                        style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    // Skeleton rows
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ height: '14px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: j === 6 ? '72px' : `${60 + Math.random() * 40}%`, animation: 'pulse 1.5s ease-in-out infinite' }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                        No bookings yet.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking, idx) => (
                      <tr
                        key={booking.id}
                        style={{
                          borderBottom: idx < bookings.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          backgroundColor: confirming === booking.id ? 'rgba(212,175,55,0.03)' : 'transparent',
                          transition: 'background-color 0.2s',
                        }}
                      >
                        {/* Customer */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <p style={{ color: '#ffffff', fontWeight: 500, fontSize: '0.875rem', marginBottom: '2px' }}>
                            {booking.customer_name}
                          </p>
                          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                            {booking.customer_email}
                          </p>
                        </td>

                        {/* Vehicle */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          {booking.vehicles?.[0] ? (
                            <>
                              <p style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 500, marginBottom: '2px' }}>
                                {booking.vehicles[0].name}
                              </p>
                              <p style={{ color: 'rgba(212,175,55,0.6)', fontSize: '0.72rem' }}>
                                {booking.vehicles[0].brand}
                              </p>
                            </>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>

                        {/* Pickup date */}
                        <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                          <p style={{ color: '#ffffff', fontSize: '0.875rem' }}>
                            {new Date(booking.pickup_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                            {booking.pickup_time?.slice(0, 5)}
                          </p>
                        </td>

                        {/* Duration */}
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                          {booking.duration_hours}h
                        </td>

                        {/* Total price */}
                        <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.9rem' }}>
                            ₦{Number(booking.total_price).toLocaleString()}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <StatusBadge status={booking.status} />
                        </td>

                        {/* Action */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          {booking.status === 'pending' ? (
                            <button
                              onClick={() => confirmBooking(booking.id)}
                              disabled={confirming === booking.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '0.35rem 0.85rem',
                                backgroundColor: confirming === booking.id ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.15)',
                                border: '1px solid rgba(34,197,94,0.35)',
                                borderRadius: '5px',
                                color: 'rgb(134,239,172)',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                cursor: confirming === booking.id ? 'not-allowed' : 'pointer',
                                opacity: confirming === booking.id ? 0.6 : 1,
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {confirming === booking.id ? (
                                <div style={{ width: '10px', height: '10px', border: '1.5px solid rgba(134,239,172,0.3)', borderTop: '1.5px solid rgb(134,239,172)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                              ) : (
                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0 }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              Confirm
                            </button>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </main>
  )
}
