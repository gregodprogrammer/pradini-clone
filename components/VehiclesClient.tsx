'use client'

import { useState } from 'react'
import VehicleCard from '@/components/VehicleCard'

export interface Vehicle {
  id: string
  name: string
  brand: string
  category: string
  price_per_hour: number
  price_per_day: number
}

type Filter = 'All' | 'SUV' | 'Sedan' | 'Van'
const FILTERS: Filter[] = ['All', 'SUV', 'Sedan', 'Van']

export default function VehiclesClient({ vehicles }: { vehicles: Vehicle[] }) {
  const [active, setActive] = useState<Filter>('All')

  const filtered = active === 'All' ? vehicles : vehicles.filter((v) => v.category === active)

  return (
    <div>
      {/* Filter buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '3rem',
        }}
      >
        {FILTERS.map((filter) => {
          const isActive = active === filter
          return (
            <button
              key={filter}
              onClick={() => setActive(filter)}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '6px',
                border: isActive ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.12)',
                backgroundColor: isActive ? '#D4AF37' : 'transparent',
                color: isActive ? '#0A0A0A' : 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {filter}
            </button>
          )
        })}

        {/* Count */}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '5rem 1rem',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          <svg
            width="48"
            height="48"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
            style={{ margin: '0 auto 1rem', display: 'block', color: 'rgba(212,175,55,0.3)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
          </svg>
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.4)' }}>
            No vehicles found
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            No {active} vehicles are currently available.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filtered.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              id={vehicle.id}
              name={vehicle.name}
              brand={vehicle.brand}
              category={vehicle.category}
              price_per_hour={vehicle.price_per_hour}
              price_per_day={vehicle.price_per_day}
              bookHref={`/book/${vehicle.id}`}
              bookLabel="Book This Vehicle"
            />
          ))}
        </div>
      )}
    </div>
  )
}
