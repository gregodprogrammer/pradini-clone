import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pradini — Premium Mobility in Lagos',
  description: "Lagos's premier chauffeur experience. Premium vehicles, professional drivers, unforgettable journeys.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
