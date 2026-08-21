import { createClient } from '@/lib/supabase/server'
import { actualizarJugador, eliminarJugador } from '../actions'
import { redirect } from 'next/navigation'

export default async function JugadorDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: jugador }, { data: transacciones }] = await Promise.all([
    supabase.from('jugadores').select('*').eq('id', id).single(),
    supabase
      .from('transacciones')
      .select('*, partidos(rival, fecha)')
      .eq('jugador_id', id)
      .order('fecha', { ascending: false }),
  ])

  if (!jugador) redirect('/jugadores')

  const totalAportado = transacciones?.reduce((sum, t) => sum + Number(t.monto), 0) ?? 0

  async function guardar(formData: FormData) {
    'use server'
    await actualizarJugador(id, formData)
  }

  async function borrar() {
    'use server'
    await eliminarJugador(id)
    redirect('/jugadores')
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">{jugador.nombre_completo}</h1>

      <form action={guardar} className="space-y-3 rounded-2xl bg-slate-900 p-4">
        <input name="nombre_completo" defaultValue={jugador.nombre_completo} required
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
        <div className="grid grid-cols-2 gap-3">
          <input name="aka" defaultValue={jugador.aka ?? ''} placeholder="A.K.A"
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          <input name="numero_jersey" type="number" defaultValue={jugador.numero_jersey ?? ''}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
        </div>
        <input name="nombre_jersey" defaultValue={jugador.nombre_jersey ?? ''}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
        <div className="grid grid-cols-2 gap-3">
          <select name="tipo_compromiso" defaultValue={jugador.tipo_compromiso}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white">
            <option value="por_partido">Por partido</option>
            <option value="fijo">Fijo</option>
          </select>
          <select name="estado" defaultValue={jugador.estado}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        <button className="w-full rounded-lg bg-orange-600 py-2 font-semibold text-white">
          Guardar cambios
        </button>
      </form>

      <div className="rounded-2xl bg-slate-900 p-4">
        <p className="text-sm text-slate-400">Total aportado histórico</p>
        <p className="text-2xl font-bold text-white">
          ${totalAportado.toLocaleString('es-MX')} MXN
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm text-slate-400">Historial de aportaciones</p>
        <div className="space-y-2">
          {transacciones?.map((t) => (
            <div key={t.id} className="flex justify-between rounded-lg bg-slate-900 p-3 text-sm">
              <div>
                <p className="text-white">{t.concepto}</p>
                <p className="text-xs text-slate-500">
                  {t.fecha} {t.partidos && `· vs ${t.partidos.rival}`} · {t.forma_pago}
                </p>
              </div>
              <span className="font-semibold text-green-400">
                ${Number(t.monto).toLocaleString('es-MX')}
              </span>
            </div>
          ))}
          {!transacciones?.length && (
            <p className="text-sm text-slate-500">Sin aportaciones registradas</p>
          )}
        </div>
      </div>

      <form action={borrar}>
        <button className="w-full rounded-lg border border-red-800 py-2 text-sm text-red-400">
          Eliminar jugador
        </button>
      </form>
    </div>
  )
}
