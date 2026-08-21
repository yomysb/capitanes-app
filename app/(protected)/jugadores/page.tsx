import { createClient } from '@/lib/supabase/server'
import { crearJugador } from './actions'
import Link from 'next/link'

const badgeEstado: Record<string, string> = {
  activo: 'bg-green-500/20 text-green-400',
  inactivo: 'bg-yellow-500/20 text-yellow-400',
  baja: 'bg-red-500/20 text-red-400',
}

export default async function JugadoresPage() {
  const supabase = await createClient()
  const { data: jugadores } = await supabase
    .from('jugadores')
    .select('*')
    .order('nombre_completo')

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Jugadores</h1>

      <details className="rounded-2xl bg-slate-900 p-4">
        <summary className="cursor-pointer font-medium text-orange-400">
          + Nuevo jugador
        </summary>
        <form action={crearJugador} className="mt-4 space-y-3">
          <input name="nombre_completo" required placeholder="Nombre completo"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          <div className="grid grid-cols-2 gap-3">
            <input name="aka" placeholder="A.K.A / Apodo"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
            <input name="numero_jersey" type="number" placeholder="# Jersey"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          </div>
          <input name="nombre_jersey" placeholder="Nombre en el jersey"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          <select name="tipo_compromiso" required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white">
            <option value="por_partido">Por partido</option>
            <option value="fijo">Fijo</option>
          </select>
          <button className="w-full rounded-lg bg-orange-600 py-2 font-semibold text-white">
            Guardar
          </button>
        </form>
      </details>

      <div className="space-y-2">
        {jugadores?.map((j) => (
          <Link
            key={j.id}
            href={`/jugadores/${j.id}`}
            className="flex items-center justify-between rounded-xl bg-slate-900 p-3"
          >
            <div>
              <p className="font-medium text-white">
                #{j.numero_jersey ?? '--'} {j.nombre_completo}
              </p>
              <p className="text-xs text-slate-400">
                {j.aka && `"${j.aka}" · `}
                {j.tipo_compromiso === 'fijo' ? 'Fijo' : 'Por partido'}
              </p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs ${badgeEstado[j.estado]}`}>
              {j.estado}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
