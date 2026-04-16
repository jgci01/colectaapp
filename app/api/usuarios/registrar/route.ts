import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { email, password, nombre } = await req.json()
    const userRecord = await adminAuth.createUser({ email, password, displayName: nombre })
    await adminDb.collection('usuarios').doc(userRecord.uid).set({
      uid: userRecord.uid, 
      nombre, 
      email, 
      rol: 'user', 
      creadoEn: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true, uid: userRecord.uid })
  } catch (err: any) {
    console.error('[registrar]', err)
    const msg = err.code === 'auth/email-already-exists' ? 'Email ya registrado' : 'Error al registrar'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
