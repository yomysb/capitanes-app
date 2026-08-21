import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: balance }, { data: record }, { data: proximoPartido }] = await Promise.all([
    supabase.from('v_balance_caja').select('*').single(),
    supabase.from('v_record_deportivo').select('*').single(),
    supabase
      .from('partidos')
      .select('rival, fecha, hora, cancha')
      .eq('estado', 'programado')
      .order('fecha', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-gradient-to-br from-orange-600 to-orange-800 p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">Balance en Caja</p>
        <p className="text-3xl font-bold">
          ${balance?.balance?.toLocaleString('es-MX') ?? '0'} MXN
        </p>
        <div className="mt-2 flex gap-4 text-xs opacity-90">
          <span>Ingresos: ${balance?.total_ingresos?.toLocaleString('es-MX') ?? 0}</span>
          <span>Gastos: ${balance?.total_gastos?.toLocaleString('es-MX') ?? 0}</span>
        </div>
      </section>

      <section className="rounded-2xl bg-slate-900 p-5 shadow-lg">
        <p className="mb-2 text-sm text-slate-400">Próximo partido</p>
        {proximoPartido ? (
          <div className="text-white">
            <p className="text-lg font-semibold">vs {proximoPartido.rival}</p>
            <p className="text-sm text-slate-400">
              {proximoPartido.fecha} · {proximoPartido.hora} · {proximoPartido.cancha}
            </p>
          </div>
        ) : (
          <p className="text-slate-500">Sin partidos programados</p>
        )}
      </section>

      <section className="rounded-2xl bg-slate-900 p-5 shadow-lg">
        <p className="mb-3 text-sm text-slate-400">Récord deportivo</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{record?.partidos_jugados ?? 0}</p>
            <p className="text-xs text-slate-500">Jugados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{record?.ganados ?? 0}</p>
            <p className="text-xs text-slate-500">Ganados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{record?.perdidos ?? 0}</p>
            <p className="text-xs text-slate-500">Perdidos</p>
          </div>
        </div>
        <div className="mt-3 flex justify-between text-sm text-slate-400">
          <span>PF: {record?.puntos_favor ?? 0}</span>
          <span>PC: {record?.puntos_contra ?? 0}</span>
          <span>Dif: {(record?.puntos_favor ?? 0) - (record?.puntos_contra ?? 0)}</span>
        </div>
      </section>
    </div>
  )
}
