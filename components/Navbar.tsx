'use client'

const NAV_LINKS = [
  { href: '#vehicles', label: 'Vehicles' },
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#drivers', label: 'About' },
]

export default function Navbar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212,175,55,0.12)',
      }}
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
          }}
        >
          {/* Logo — left */}
          <a
            href="#"
            style={{
              flexShrink: 0,
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#D4AF37',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Pradini
          </a>

          {/* Nav links — center, hidden on mobile */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2.5rem',
            }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                style={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color = '#D4AF37'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)'
                }}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Book Now — right */}
          <a
            href="#vehicles"
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.6rem 1.25rem',
              backgroundColor: '#D4AF37',
              color: '#0A0A0A',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Book Now
          </a>
        </div>
      </div>
    </nav>
  )
}
