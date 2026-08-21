import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NavLink from '@/components/NavLink'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
        <span className="text-lg font-bold text-white">🏀 Capitanes</span>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-slate-400 hover:text-white">Salir</button>
        </form>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t border-slate-800 bg-slate-950 py-2">
        <NavLink href="/dashboard" label="Inicio" icon="🏠" />
        <NavLink href="/jugadores" label="Jugadores" icon="👤" />
        <NavLink href="/partidos" label="Partidos" icon="🏀" />
        <NavLink href="/finanzas" label="Finanzas" icon="💰" />
        <NavLink href="/torneos" label="Torneos" icon="🏆" />
      </nav>
    </div>
  )
}
