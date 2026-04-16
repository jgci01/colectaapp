'use client'
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ModalPago from '@/components/ModalPago'
import { DEMO_MODE, demoEstado } from '@/lib/demo-data'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EstadoColecta } from '@/lib/types'

function DashboardContent() {
  const { perfil, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [estado, setEstado] = useState<EstadoColecta | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !perfil) {
      router.push('/')
    }
  }, [perfil, authLoading, router])

  useEffect(() => {
    if (searchParams.get('pago') === 'ok') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }

    if (DEMO_MODE) {
      setEstado(demoEstado)
      return
    }

    return onSnapshot(doc(db, 'colecta', 'estado'), (snap) => {
      if (snap.exists()) setEstado(snap.data() as EstadoColecta)
    })
  }, [searchParams])

  if (authLoading || !perfil || !estado) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span className="spinner"></span>
      </div>
    )
  }

  const porcentaje = Math.min(Math.round((estado.montoRecaudado / estado.montoObjetivo) * 100), 100)

  return (
    <>
      <Navbar />
      <main className="page">
        {showSuccess && (
          <div className="alert alert-success" style={{ textAlign: 'center', marginBottom: 24 }}>
            🎯 ¡Gracias! Tu aporte ha sido registrado correctamente.
          </div>
        )}

        <div className="card" style={{ textAlign: 'center', marginBottom: 32, padding: '48px 24px' }}>
          <h2 style={{ color: 'var(--muted)', fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Progreso de la colecta
          </h2>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, color: 'var(--accent)', lineHeight: 1 }}>
            ${estado.montoRecaudado.toLocaleString()}
          </div>
          <p style={{ color: 'var(--muted)', marginTop: 8 }}>recaudados de ${estado.montoObjetivo.toLocaleString()}</p>
          
          <div style={{ marginTop: 32, marginBottom: 12 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${porcentaje}%` }}></div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
            {porcentaje}% completado
          </div>

          <button className="btn-primary" style={{ marginTop: 32, padding: '14px 40px', fontSize: 18 }} 
            onClick={() => setShowModal(true)}>
            💸 Aportar a la colecta
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Recaudado</div>
            <div className="stat-value accent">${estado.montoRecaudado.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Retirado</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>-${estado.montoRetirado.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Disponible</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>${estado.montoDisponible.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Objetivo</div>
            <div className="stat-value" style={{ color: 'var(--muted)' }}>${estado.montoObjetivo.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <a href="/historial" style={{ fontSize: 14, fontWeight: 500 }}>
            Ver historial completo de movimientos →
          </a>
        </div>
      </main>

      <ModalPago isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span className="spinner"></span>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
