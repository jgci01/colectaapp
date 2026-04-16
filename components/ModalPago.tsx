'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { DEMO_MODE } from '@/lib/demo-data'

export default function ModalPago({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { perfil } = useAuth()
  const [monto, setMonto] = useState<number>(1000)
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handlePagar = async () => {
    if (monto < 100) return alert('Monto mínimo $100')
    
    if (DEMO_MODE) {
      alert('Modo demo: en producción te redirigirías a Mercado Pago')
      onClose()
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: perfil?.uid,
          usuarioEmail: perfil?.email,
          usuarioNombre: perfil?.nombre,
          monto,
          descripcion
        })
      })
      const { initPoint } = await res.json()
      window.location.href = initPoint
    } catch (_) {
      alert('Error al iniciar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2>💸 Aportar a la colecta</h2>
          <button onClick={onClose} style={{ background: 'none', fontSize: 24, padding: 0 }}>×</button>
        </div>

        <div className="form-group">
          <label>Monto a donar</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[500, 1000, 2000, 5000].map(m => (
              <button key={m} 
                className={monto === m ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setMonto(m)}>
                ${m.toLocaleString()}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: 12, color: 'var(--muted)' }}>$</span>
            <input type="number" value={monto} 
              onChange={e => setMonto(Number(e.target.value))}
              style={{ paddingLeft: 30 }} />
          </div>
        </div>

        <div className="form-group">
          <label>Mensaje opcional</label>
          <textarea value={descripcion} 
            onChange={e => setDescripcion(e.target.value)}
            placeholder="¡Suerte con la colecta!" rows={3} />
        </div>

        <button className="btn-primary" style={{ width: '100%', marginTop: 10 }} 
          onClick={handlePagar} disabled={loading}>
          {loading ? <span className="spinner"></span> : '🛒 Ir a pagar'}
        </button>
      </div>
    </div>
  )
}
