'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { DEMO_MODE, demoEstado, demoRetiros } from '@/lib/demo-data'
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EstadoColecta, Retiro } from '@/lib/types'

export default function AdminPage() {
  const { esAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [estado, setEstado] = useState<EstadoColecta | null>(null)
  const [monto, setMonto] = useState<number>(0)
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [retiros, setRetiros] = useState<Retiro[]>([])

  useEffect(() => {
    if (!authLoading && !esAdmin) {
      router.push('/dashboard')
    }
  }, [esAdmin, authLoading, router])

  useEffect(() => {
    if (DEMO_MODE) {
      setEstado(demoEstado)
      setRetiros(demoRetiros as Retiro[])
      return
    }
    const unsubEstado = onSnapshot(doc(db, 'colecta', 'estado'), (snap) => {
      if (snap.exists()) setEstado(snap.data() as EstadoColecta)
    })
    const qRetiros = query(collection(db, 'retiros'), orderBy('fecha', 'desc'))
    const unsubRetiros = onSnapshot(qRetiros, (snap) => {
      setRetiros(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Retiro)))
    })
    return () => { unsubEstado(); unsubRetiros(); }
  }, [])

  const handleRetiro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estado || monto > estado.montoDisponible) return alert('Monto superior al disponible')
    if (monto <= 0) return alert('Monto inválido')

    setLoading(true)
    if (DEMO_MODE) {
      setSuccess(true)
      setMonto(0)
      setMotivo('')
      setLoading(false)
      setTimeout(() => setSuccess(false), 3000)
      return
    }

    try {
      const res = await fetch('/api/retiros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto, motivo })
      })
      if (res.ok) {
        setSuccess(true)
        setMonto(0)
        setMotivo('')
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch {
      alert('Error al registrar retiro')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !esAdmin || !estado) return <div className="spinner"></div>

  return (
    <>
      <Navbar />
      <main className="page">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 24 }}>⚙️ Panel de Administración</h1>

        <div className="stats-grid" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div className="stat-label">Saldo Disponible</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>${estado.montoDisponible.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Recaudado</div>
            <div className="stat-value">${estado.montoRecaudado.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Retirado</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>-${estado.montoRetirado.toLocaleString()}</div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 20 }}>Registrar Retiro de Fondos</h2>
          {success && <div className="alert alert-success">Retiro registrado con éxito</div>}
          
          <form onSubmit={handleRetiro}>
            <div className="form-group">
              <label>Monto a retirar</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: 12, color: 'var(--muted)' }}>$</span>
                <input type="number" value={monto} onChange={e => setMonto(Number(e.target.value))} required style={{ paddingLeft: 30 }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Máximo disponible: ${estado.montoDisponible.toLocaleString()}</p>
            </div>

            <div className="form-group">
              <label>Motivo del retiro</label>
              <textarea value={motivo} onChange={e => setMotivo(e.target.value)} required placeholder="Ej: Pago de salón, compra de comida..." />
            </div>

            <button className="btn-primary" style={{ marginTop: 10 }} disabled={loading}>
              {loading ? <span className="spinner"></span> : '💾 Registrar Retiro'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 20 }}>Retiros Recientes</h2>
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Motivo</th>
                  <th>Admin</th>
                </tr>
              </thead>
              <tbody>
                {retiros.map(r => (
                  <tr key={r.id}>
                    <td>{new Date(r.fecha).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>-${r.monto.toLocaleString()}</td>
                    <td>{r.motivo}</td>
                    <td>{r.adminNombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
