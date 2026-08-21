import { createClient } from '@/lib/supabase/server'
import { crearPartido } from './actions'
import Link from 'next/link'

export default async function PartidosPage() {
  const supabase = await createClient()
  const [{ data: partidos }, { data: torneos }] = await Promise.all([
    supabase.from('partidos').select('*').order('fecha', { ascending: false }),
    supabase.from('torneos').select('id, nombre').eq('activo', true),
  ])

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Partidos</h1>

      <details className="rounded-2xl bg-slate-900 p-4">
        <summary className="cursor-pointer font-medium text-orange-400">+ Nuevo partido</summary>
        <form action={crearPartido} className="mt-4 space-y-3">
          <select name="torneo_id" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white">
            <option value="">Sin torneo</option>
            {torneos?.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
          <input name="rival" required placeholder="Rival"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          <div className="grid grid-cols-2 gap-3">
            <input name="fecha" type="date" required
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
            <input name="hora" type="time"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="cancha" placeholder="Cancha"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
            <input name="color_uniforme" placeholder="Color uniforme"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          </div>
          <input name="jornada" type="number" placeholder="Jornada #"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          <button className="w-full rounded-lg bg-orange-600 py-2 font-semibold text-white">
            Crear partido
          </button>
        </form>
      </details>

      <div className="space-y-2">
        {partidos?.map((p) => (
          <Link key={p.id} href={`/partidos/${p.id}/asistencia`}
            className="block rounded-xl bg-slate-900 p-3">
            <div className="flex justify-between">
              <p className="font-medium text-white">vs {p.rival}</p>
              <span className="text-xs text-slate-400">{p.fecha}</span>
            </div>
            <p className="text-xs text-slate-500">
              {p.cancha ?? 'Sin cancha'} ·{' '}
              {p.estado === 'jugado'
                ? `${p.puntos_capitanes} - ${p.puntos_rival}`
                : 'Programado'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
