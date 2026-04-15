'use client'

import Image from 'next/image'
import Link from 'next/link'

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

export interface VehicleCardProps {
  id: string
  name: string
  brand: string
  category: string
  price_per_hour: number
  price_per_day?: number
  bookHref?: string
  bookLabel?: string
}

export default function VehicleCard({ name, brand, category, price_per_hour, price_per_day, bookHref = '#', bookLabel = 'Book Now' }: VehicleCardProps) {
  const imgSrc = VEHICLE_IMAGES[name] ?? FALLBACK_IMAGE
  const badgeStyle = CATEGORY_STYLES[category] ?? {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.2)',
  }

  return (
    <div
      style={{
        backgroundColor: '#111111',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '192px', backgroundColor: '#0f0f0f', overflow: 'hidden' }}>
        <Image
          src={imgSrc}
          alt={name}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(17,17,17,0.65) 0%, transparent 55%)',
          }}
        />
        {/* Category badge */}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              ...badgeStyle,
            }}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p
          style={{
            fontSize: '0.68rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(212,175,55,0.7)',
            marginBottom: '4px',
          }}
        >
          {brand}
        </p>
        <h3
          style={{
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '1.05rem',
            marginBottom: '12px',
            lineHeight: 1.3,
          }}
        >
          {name}
        </h3>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Per hour</p>
            <p style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.15rem', lineHeight: 1 }}>
              ₦{Number(price_per_hour).toLocaleString()}
            </p>
            {price_per_day !== undefined && (
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                ₦{Number(price_per_day).toLocaleString()} / day
              </p>
            )}
          </div>
          <Link
            href={bookHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.45rem 1rem',
              backgroundColor: '#D4AF37',
              color: '#0A0A0A',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            {bookLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
