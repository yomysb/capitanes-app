'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function crearCampana(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('campanas').insert({
    nombre: formData.get('nombre') as string,
    descripcion: formData.get('descripcion') as string || null,
    meta: Number(formData.get('meta')) || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/finanzas')
}

export async function registrarGasto(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('gastos').insert({
    campana_id: formData.get('campana_id') as string || null,
    concepto: formData.get('concepto') as string,
    categoria: formData.get('categoria') as string,
    monto: Number(formData.get('monto')),
    fecha: formData.get('fecha') as string,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/finanzas/gastos')
}

export async function registrarAportacionCampana(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('transacciones').insert({
    jugador_id: formData.get('jugador_id') as string,
    campana_id: formData.get('campana_id') as string,
    concepto: formData.get('concepto') as string,
    monto: Number(formData.get('monto')),
    forma_pago: formData.get('forma_pago') as string,
    tipo: 'ingreso',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/finanzas')
}
