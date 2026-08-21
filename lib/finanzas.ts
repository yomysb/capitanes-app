import { createClient } from '@/lib/supabase/server'

interface ResultadoCalculo {
  montoIndividual: number
  totalJugadoresPagando: number
  totalRecaudadoEsperado: number
}

/**
 * Calcula cuánto debe pagar cada jugador en un partido dado.
 * Monto = costoArbitraje / (jugadores fijos activos + jugadores "por partido" que asistieron)
 */
export async function calcularCuotaArbitraje(
  partidoId: string
): Promise<ResultadoCalculo> {
  const supabase = await createClient()

  const { data: partido, error: errPartido } = await supabase
    .from('partidos')
    .select('costo_arbitraje')
    .eq('id', partidoId)
    .single()

  if (errPartido || !partido) throw new Error('Partido no encontrado')

  const { data: fijos, error: errFijos } = await supabase
    .from('jugadores')
    .select('id')
    .eq('estado', 'activo')
    .eq('tipo_compromiso', 'fijo')

  if (errFijos) throw errFijos

  const { data: asistenciasPorPartido, error: errAsist } = await supabase
    .from('asistencias')
    .select('jugador_id, jugadores!inner(tipo_compromiso, estado)')
    .eq('partido_id', partidoId)
    .eq('asistio', true)
    .eq('jugadores.tipo_compromiso', 'por_partido')
    .eq('jugadores.estado', 'activo')

  if (errAsist) throw errAsist

  const totalJugadoresPagando = (fijos?.length ?? 0) + (asistenciasPorPartido?.length ?? 0)

  if (totalJugadoresPagando === 0) {
    return { montoIndividual: 0, totalJugadoresPagando: 0, totalRecaudadoEsperado: 0 }
  }

  const montoIndividual = Math.round((partido.costo_arbitraje / totalJugadoresPagando) * 100) / 100

  return {
    montoIndividual,
    totalJugadoresPagando,
    totalRecaudadoEsperado: montoIndividual * totalJugadoresPagando,
  }
}

/**
 * Registra el pago de un jugador y, si excede lo que le corresponde,
 * manda el excedente automáticamente al Fondo en Caja.
 */
export async function registrarPago(params: {
  jugadorId: string
  partidoId: string
  montoPagado: number
  montoEsperado: number
  formaPago: 'efectivo' | 'transferencia' | 'mercado_pago'
}) {
  const supabase = await createClient()
  const { jugadorId, partidoId, montoPagado, montoEsperado, formaPago } = params

  const excedente = montoPagado - montoEsperado

  const { error: errTx } = await supabase.from('transacciones').insert({
    jugador_id: jugadorId,
    partido_id: partidoId,
    concepto: 'Arbitraje',
    monto: montoEsperado,
    forma_pago: formaPago,
    tipo: 'ingreso',
  })
  if (errTx) throw errTx

  if (excedente > 0) {
    const { error: errExc } = await supabase.from('transacciones').insert({
      jugador_id: jugadorId,
      partido_id: partidoId,
      concepto: 'Excedente aportado al Fondo en Caja',
      monto: excedente,
      forma_pago: formaPago,
      tipo: 'excedente',
    })
    if (errExc) throw errExc
  }

  await supabase
    .from('asistencias')
    .update({ monto_a_pagar: montoEsperado })
    .eq('partido_id', partidoId)
    .eq('jugador_id', jugadorId)
}
