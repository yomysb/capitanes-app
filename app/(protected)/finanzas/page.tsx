import { createClient } from '@/lib/supabase/server'
import { crearCampana } from './actions'
import Link from 'next/link'

export default async function FinanzasPage() {
  const supabase = await createClient()

  const { data: campanas } = await supabase.from('campanas').select('*').eq('activa', true)

  const resumenPorCampana = await Promise.all(
    (campanas ?? []).map(async (c) => {
      const [{ data: ingresos }, { data: gastos }] = await Promise.all([
        supabase.from('transacciones').select('monto').eq('campana_id', c.id),
        supabase.from('gastos').select('monto').eq('campana_id', c.id),
      ])
      const totalIngresos = ingresos?.reduce((s, t) => s + Number(t.monto), 0) ?? 0
      const totalGastos = gastos?.reduce((s, g) => s + Number(g.monto), 0) ?? 0
      return { ...c, totalIngresos, totalGastos }
    })
  )

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Finanzas</h1>

      <div className="flex gap-2">
        <Link href="/finanzas/gastos" className="flex-1 rounded-xl bg-slate-900 p-3 text-center text-sm text-white">
          Ver Gastos →
        </Link>
      </div>

      <details className="rounded-2xl bg-slate-900 p-4">
        <summary className="cursor-pointer font-medium text-orange-400">+ Nueva campaña / fondo</summary>
        <form action={crearCampana} className="mt-4 space-y-3">
          <input name="nombre" required placeholder="Ej. Inscripción a Torneo, Uniformes"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          <input name="descripcion" placeholder="Descripción (opcional)"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          <input name="meta" type="number" step="0.01" placeholder="Meta de recaudación (opcional)"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          <button className="w-full rounded-lg bg-orange-600 py-2 font-semibold text-white">
            Crear campaña
          </button>
        </form>
      </details>

      <div className="space-y-3">
        {resumenPorCampana.map((c) => (
          <div key={c.id} className="rounded-xl bg-slate-900 p-4">
            <p className="font-medium text-white">{c.nombre}</p>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-green-400">+${c.totalIngresos.toLocaleString('es-MX')}</span>
              <span className="text-red-400">-${c.totalGastos.toLocaleString('es-MX')}</span>
              <span className="font-semibold text-white">
                ${(c.totalIngresos - c.totalGastos).toLocaleString('es-MX')}
              </span>
            </div>
            {c.meta && (
              <div className="mt-2 h-2 rounded-full bg-slate-700">
                <div
                  className="h-2 rounded-full bg-orange-500"
                  style={{ width: `${Math.min(100, (c.totalIngresos / c.meta) * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
