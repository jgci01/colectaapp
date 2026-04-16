import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'payment') return NextResponse.json({ ok: true })

    const paymentId = data.id
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const payment = await new Payment(client).get({ id: paymentId })

    if (payment.status === 'approved') {
      const { usuario_id, usuario_nombre } = payment.metadata
      const monto = payment.transaction_amount

      // Registrar el pago si no existe
      const pagoRef = adminDb.collection('pagos').doc(String(paymentId))
      const doc = await pagoRef.get()

      if (!doc.exists) {
        await adminDb.runTransaction(async (t) => {
          t.set(pagoRef, {
            id: String(paymentId),
            usuarioId: usuario_id,
            usuarioNombre: usuario_nombre,
            monto: monto,
            fecha: new Date().toISOString(),
            estado: 'aprobado',
            mpPaymentId: String(paymentId),
            mpStatus: payment.status,
          })

          const estadoRef = adminDb.collection('colecta').doc('estado')
          const estadoDoc = await t.get(estadoRef)
          const data = estadoDoc.data() || { montoRecaudado: 0, montoDisponible: 0 }
          
          t.update(estadoRef, {
            montoRecaudado: (data.montoRecaudado || 0) + monto,
            montoDisponible: (data.montoDisponible || 0) + monto,
            ultimaActualizacion: new Date().toISOString()
          })
        })

        // Aquí se podría disparar el email con Resend
        console.log(`Pago ${paymentId} procesado exitosamente`)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhook]', err)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
