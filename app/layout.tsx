import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Capitanes',
  description: 'App de gestión del equipo Capitanes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
