import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(req: NextRequest) {
  try {
    const { usuarioId, usuarioEmail, usuarioNombre, monto, descripcion } = await req.json()
    if (!monto || monto < 100) return NextResponse.json({ error: 'Monto mínimo $100' }, { status: 400 })

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const preference = new Preference(client)
    const result = await preference.create({ body: {
      items: [{ id: 'colecta', title: descripcion || 'Aporte a la colecta', quantity: 1, unit_price: monto, currency_id: 'ARS' }],
      payer: { email: usuarioEmail, name: usuarioNombre },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?pago=ok`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?pago=error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?pago=pendiente`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`,
      metadata: { usuario_id: usuarioId, usuario_nombre: usuarioNombre },
    }})

    // En sandbox se usa sandbox_init_point, en prod init_point
    const url = process.env.NODE_ENV === 'production' ? result.init_point : result.sandbox_init_point
    return NextResponse.json({ initPoint: url })
  } catch (err) {
    console.error('[api/pagos]', err)
    return NextResponse.json({ error: 'Error al crear preferencia' }, { status: 500 })
  }
}
