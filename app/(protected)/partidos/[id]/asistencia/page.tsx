import { createClient } from '@/lib/supabase/server'
import { calcularCuotaArbitraje } from '@/lib/finanzas'
import { redirect } from 'next/navigation'
import { marcarAsistencia, registrarResultado } from '../../actions'
import PagoJugadorForm from './PagoJugadorForm'

export default async function AsistenciaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: partido } = await supabase.from('partidos').select('*').eq('id', id).single()
  if (!partido) redirect('/partidos')

  const { data: asistencias } = await supabase
    .from('asistencias')
    .select('*, jugadores(*)')
    .eq('partido_id', id)
    .order('jugadores(nombre_completo)')

  const { montoIndividual, totalJugadoresPagando } = await calcularCuotaArbitraje(id)

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('jugador_id')
    .eq('partido_id', id)
    .eq('concepto', 'Arbitraje')

  const jugadoresPagados = new Set(transacciones?.map((t) => t.jugador_id))

  async function toggleAsistencia(jugadorId: string, asistio: boolean) {
    'use server'
    await marcarAsistencia(id, jugadorId, asistio)
  }

  async function guardarResultado(formData: FormData) {
    'use server'
    await registrarResultado(id, formData)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">vs {partido.rival}</h1>
        <p className="text-sm text-slate-400">{partido.fecha} · {partido.cancha}</p>
      </div>

      <div className="rounded-2xl bg-orange-600/10 border border-orange-600/30 p-4">
        <p className="text-sm text-orange-300">Cuota individual calculada</p>
        <p className="text-2xl font-bold text-white">
          ${montoIndividual.toLocaleString('es-MX')} MXN
        </p>
        <p className="text-xs text-slate-400">
          {totalJugadoresPagando} jugadores pagando · Total: ${partido.costo_arbitraje}
        </p>
      </div>

      <div className="space-y-2">
        {asistencias?.map((a) => (
          <div key={a.jugador_id} className="rounded-xl bg-slate-900 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <form action={toggleAsistencia.bind(null, a.jugador_id, !a.asistio)}>
                  <button
                    type="submit"
                    className={`h-6 w-6 rounded-md border ${
                      a.asistio ? 'bg-green-500 border-green-500' : 'border-slate-600'
                    }`}
                  >
                    {a.asistio && '✓'}
                  </button>
                </form>
                <div>
                  <p className="text-sm font-medium text-white">
                    {a.jugadores.nombre_completo}
                  </p>
                  <p className="text-xs text-slate-500">
                    {a.jugadores.tipo_compromiso === 'fijo' ? 'Fijo' : 'Por partido'}
                  </p>
                </div>
              </div>
              {jugadoresPagados.has(a.jugador_id) ? (
                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                  Pagado
                </span>
              ) : (
                <PagoJugadorForm
                  partidoId={id}
                  jugadorId={a.jugador_id}
                  montoEsperado={montoIndividual}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {partido.estado !== 'jugado' && (
        <form action={guardarResultado} className="space-y-3 rounded-2xl bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Registrar resultado final</p>
          <div className="grid grid-cols-2 gap-3">
            <input name="puntos_capitanes" type="number" required placeholder="Capitanes"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
            <input name="puntos_rival" type="number" required placeholder="Rival"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          </div>
          <button className="w-full rounded-lg bg-orange-600 py-2 font-semibold text-white">
            Guardar resultado
          </button>
        </form>
      )}
    </div>
  )
}
