import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { monto, motivo } = await req.json()
    // En una app real, aquí verificaríamos la sesión del admin vía Firebase Admin
    // Para simplificar, asumimos que llega validado del cliente en este scaffold
    
    await adminDb.runTransaction(async (t) => {
      const estadoRef = adminDb.collection('colecta').doc('estado')
      const estadoDoc = await t.get(estadoRef)
      const data = estadoDoc.data()
      
      if (!data || data.montoDisponible < monto) {
        throw new Error('Monto insuficiente')
      }

      const retiroRef = adminDb.collection('retiros').doc()
      t.set(retiroRef, {
        id: retiroRef.id,
        monto,
        motivo,
        fecha: new Date().toISOString(),
        adminId: 'admin1',
        adminNombre: 'Admin Principal'
      })

      t.update(estadoRef, {
        montoDisponible: data.montoDisponible - monto,
        montoRetirado: (data.montoRetirado || 0) + monto,
        ultimaActualizacion: new Date().toISOString()
      })
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
