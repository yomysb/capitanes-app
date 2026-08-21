import { createClient } from '@/lib/supabase/server'
import { registrarGasto } from '../actions'

export default async function GastosPage() {
  const supabase = await createClient()
  const [{ data: gastos }, { data: campanas }, { data: balance }] = await Promise.all([
    supabase.from('gastos').select('*, campanas(nombre)').order('fecha', { ascending: false }),
    supabase.from('campanas').select('id, nombre').eq('activa', true),
    supabase.from('v_balance_caja').select('*').single(),
  ])

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Gastos</h1>

      <div className="rounded-2xl bg-slate-900 p-4">
        <p className="text-sm text-slate-400">Balance disponible</p>
        <p className="text-2xl font-bold text-white">
          ${balance?.balance?.toLocaleString('es-MX') ?? 0} MXN
        </p>
      </div>

      <details className="rounded-2xl bg-slate-900 p-4">
        <summary className="cursor-pointer font-medium text-orange-400">+ Nuevo gasto</summary>
        <form action={registrarGasto} className="mt-4 space-y-3">
          <select name="campana_id" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white">
            <option value="">Sin campaña / Caja general</option>
            {campanas?.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <input name="concepto" required placeholder="Concepto"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          <div className="grid grid-cols-2 gap-3">
            <input name="categoria" required placeholder="Categoría (ej. Uniformes)"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
            <input name="monto" type="number" step="0.01" required placeholder="Monto"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          </div>
          <input name="fecha" type="date" required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          <button className="w-full rounded-lg bg-orange-600 py-2 font-semibold text-white">
            Registrar gasto
          </button>
        </form>
      </details>

      <div className="space-y-2">
        {gastos?.map((g) => (
          <div key={g.id} className="flex justify-between rounded-xl bg-slate-900 p-3">
            <div>
              <p className="text-sm font-medium text-white">{g.concepto}</p>
              <p className="text-xs text-slate-500">
                {g.categoria} {g.campanas && `· ${g.campanas.nombre}`} · {g.fecha}
              </p>
            </div>
            <span className="font-semibold text-red-400">
              -${Number(g.monto).toLocaleString('es-MX')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
