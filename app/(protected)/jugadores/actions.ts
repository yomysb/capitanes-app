'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function crearJugador(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('jugadores').insert({
    nombre_completo: formData.get('nombre_completo') as string,
    aka: formData.get('aka') as string || null,
    numero_jersey: Number(formData.get('numero_jersey')) || null,
    nombre_jersey: formData.get('nombre_jersey') as string || null,
    tipo_compromiso: formData.get('tipo_compromiso') as string,
    estado: 'activo',
  })

  if (error) throw new Error(error.message)
  revalidatePath('/jugadores')
}

export async function actualizarJugador(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('jugadores')
    .update({
      nombre_completo: formData.get('nombre_completo') as string,
      aka: formData.get('aka') as string || null,
      numero_jersey: Number(formData.get('numero_jersey')) || null,
      nombre_jersey: formData.get('nombre_jersey') as string || null,
      tipo_compromiso: formData.get('tipo_compromiso') as string,
      estado: formData.get('estado') as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/jugadores')
  revalidatePath(`/jugadores/${id}`)
}

export async function eliminarJugador(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('jugadores').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/jugadores')
}
