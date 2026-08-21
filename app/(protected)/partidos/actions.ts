'use server'

import { createClient } from '@/lib/supabase/server'
import { registrarPago } from '@/lib/finanzas'
import { revalidatePath } from 'next/cache'

export async function crearPartido(formData: FormData) {
  const supabase = await createClient()

  const { data: config } = await supabase
    .from('config')
    .select('valor')
    .eq('clave', 'costo_arbitraje')
    .single()

  const { data: partido, error } = await supabase
    .from('partidos')
    .insert({
      torneo_id: formData.get('torneo_id') as string || null,
      jornada: Number(formData.get('jornada')) || null,
      rival: formData.get('rival') as string,
      fecha: formData.get('fecha') as string,
      hora: formData.get('hora') as string || null,
      cancha: formData.get('cancha') as string || null,
      color_uniforme: formData.get('color_uniforme') as string || null,
      costo_arbitraje: config?.valor ?? 250,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  const { data: jugadores } = await supabase
    .from('jugadores')
    .select('id')
    .eq('estado', 'activo')

  if (jugadores?.length) {
    await supabase.from('asistencias').insert(
      jugadores.map((j) => ({ partido_id: partido.id, jugador_id: j.id, asistio: false }))
    )
  }

  revalidatePath('/partidos')
  return partido.id
}

export async function marcarAsistencia(partidoId: string, jugadorId: string, asistio: boolean) {
  const supabase = await createClient()
  await supabase
    .from('asistencias')
    .update({ asistio })
    .eq('partido_id', partidoId)
    .eq('jugador_id', jugadorId)
  revalidatePath(`/partidos/${partidoId}/asistencia`)
}

export async function pagarArbitraje(params: {
  jugadorId: string
  partidoId: string
  montoEsperado: number
  montoPagado: number
  formaPago: 'efectivo' | 'transferencia' | 'mercado_pago'
}) {
  await registrarPago({
    jugadorId: params.jugadorId,
    partidoId: params.partidoId,
    montoPagado: params.montoPagado,
    montoEsperado: params.montoEsperado,
    formaPago: params.formaPago,
  })
  revalidatePath(`/partidos/${params.partidoId}/asistencia`)
}

export async function registrarResultado(partidoId: string, formData: FormData) {
  const supabase = await createClient()
  await supabase
    .from('partidos')
    .update({
      puntos_capitanes: Number(formData.get('puntos_capitanes')),
      puntos_rival: Number(formData.get('puntos_rival')),
      estado: 'jugado',
    })
    .eq('id', partidoId)
  revalidatePath('/partidos')
  revalidatePath(`/partidos/${partidoId}/asistencia`)
}
