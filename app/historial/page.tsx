'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'
import { DEMO_MODE, demoPagos, demoRetiros } from '@/lib/demo-data'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Pago, Retiro } from '@/lib/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Historial() {
  const { loading: authLoading } = useAuth()
  const [tab, setTab] = useState<'pagos' | 'retiros'>('pagos')
  const [pagos, setPagos] = useState<Pago[]>([])
  const [retiros, setRetiros] = useState<Retiro[]>([])

  useEffect(() => {
    if (DEMO_MODE) {
      setPagos(demoPagos as Pago[])
      setRetiros(demoRetiros as Retiro[])
      return
    }

    const qPagos = query(collection(db, 'pagos'), orderBy('fecha', 'desc'))
    const unsubPagos = onSnapshot(qPagos, (snap) => {
      setPagos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pago)))
    })

    const qRetiros = query(collection(db, 'retiros'), orderBy('fecha', 'desc'))
    const unsubRetiros = onSnapshot(qRetiros, (snap) => {
      setRetiros(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Retiro)))
    })

    return () => { unsubPagos(); unsubRetiros(); }
  }, [])

  if (authLoading) return <div className="spinner"></div>

  return (
    <>
      <Navbar />
      <main className="page">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 24 }}>Historial de Movimientos</h1>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button className={tab === 'pagos' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('pagos')}>
            💰 Pagos ({pagos.length})
          </button>
          <button className={tab === 'retiros' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('retiros')}>
            💸 Retiros ({retiros.length})
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {tab === 'pagos' ? (
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.usuarioNombre}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 600 }}>+${p.monto.toLocaleString()}</td>
                    <td style={{ color: 'var(--muted)' }}>{format(new Date(p.fecha), 'dd MMM, HH:mm', { locale: es })}</td>
                    <td>
                      <span className={`badge badge-${p.estado}`}>{p.estado}</span>
                    </td>
                  </tr>
                ))}
                {pagos.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No hay pagos registrados</td></tr>}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Motivo</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Admin</th>
                </tr>
              </thead>
              <tbody>
                {retiros.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.motivo}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>-${r.monto.toLocaleString()}</td>
                    <td style={{ color: 'var(--muted)' }}>{format(new Date(r.fecha), 'dd MMM, HH:mm', { locale: es })}</td>
                    <td style={{ fontSize: 13 }}>{r.adminNombre}</td>
                  </tr>
                ))}
                {retiros.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No hay retiros registrados</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  )
}
