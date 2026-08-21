'use client'

import { useState } from 'react'
import { pagarArbitraje } from '../../actions'

export default function PagoJugadorForm({
  partidoId,
  jugadorId,
  montoEsperado,
}: {
  partidoId: string
  jugadorId: string
  montoEsperado: number
}) {
  const [open, setOpen] = useState(false)
  const [monto, setMonto] = useState(montoEsperado)
  const [formaPago, setFormaPago] = useState<'efectivo' | 'transferencia' | 'mercado_pago'>('efectivo')
  const [loading, setLoading] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-slate-700 px-3 py-1 text-xs text-white"
      >
        Cobrar
      </button>
    )
  }

  return (
    <div className="absolute right-4 z-10 mt-2 w-56 space-y-2 rounded-xl bg-slate-800 p-3 shadow-xl">
      <input
        type="number"
        step="0.01"
        value={monto}
        onChange={(e) => setMonto(Number(e.target.value))}
        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white"
      />
      <select
        value={formaPago}
        onChange={(e) => setFormaPago(e.target.value as typeof formaPago)}
        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white"
      >
        <option value="efectivo">Efectivo</option>
        <option value="transferencia">Transferencia/SPEI</option>
        <option value="mercado_pago">Mercado Pago</option>
      </select>
      {monto > montoEsperado && (
        <p className="text-xs text-orange-400">
          Excedente ${(monto - montoEsperado).toFixed(2)} va al Fondo en Caja
        </p>
      )}
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={async () => {
            setLoading(true)
            await pagarArbitraje({
              jugadorId,
              partidoId,
              montoEsperado,
              montoPagado: monto,
              formaPago,
            })
            setLoading(false)
            setOpen(false)
          }}
          className="flex-1 rounded-lg bg-orange-600 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? '...' : 'Confirmar'}
        </button>
        <button onClick={() => setOpen(false)} className="px-2 text-sm text-slate-400">
          ✕
        </button>
      </div>
    </div>
  )
}
