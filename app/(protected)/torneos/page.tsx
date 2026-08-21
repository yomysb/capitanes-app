import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function TorneosPage() {
  const supabase = await createClient()
  const { data: torneos } = await supabase.from('torneos').select('*').order('fecha_inicio', { ascending: false })

  async function crearTorneo(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('torneos').insert({
      nombre: formData.get('nombre') as string,
      fecha_inicio: formData.get('fecha_inicio') as string || null,
      fecha_fin: formData.get('fecha_fin') as string || null,
    })
    revalidatePath('/torneos')
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Torneos</h1>

      <details className="rounded-2xl bg-slate-900 p-4">
        <summary className="cursor-pointer font-medium text-orange-400">+ Nuevo torneo</summary>
        <form action={crearTorneo} className="mt-4 space-y-3">
          <input name="nombre" required placeholder="Nombre del torneo"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          <div className="grid grid-cols-2 gap-3">
            <input name="fecha_inicio" type="date"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
            <input name="fecha_fin" type="date"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
          </div>
          <button className="w-full rounded-lg bg-orange-600 py-2 font-semibold text-white">
            Crear torneo
          </button>
        </form>
      </details>

      <div className="space-y-2">
        {torneos?.map((t) => (
          <div key={t.id} className="rounded-xl bg-slate-900 p-3">
            <p className="font-medium text-white">{t.nombre}</p>
            <p className="text-xs text-slate-500">
              {t.fecha_inicio ?? '—'} a {t.fecha_fin ?? '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
