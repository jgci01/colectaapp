'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { DEMO_MODE } from '@/lib/demo-data'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, registrar } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await registrar(email, password, nombre)
      }
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 48 }}>🎯</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginTop: 12 }}>
            {process.env.NEXT_PUBLIC_NOMBRE_COLECTA || 'Colecta App'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Gestión de aportes grupales</p>
        </div>

        {DEMO_MODE && (
          <div className="alert alert-success" style={{ background: 'rgba(200,240,90,0.1)', borderColor: 'var(--accent)', color: 'var(--accent)', textAlign: 'center' }}>
            <strong>Modo demo activo</strong><br />Inicia sesión con cualquier dato
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface2)', padding: 4, borderRadius: 10 }}>
          <button className={isLogin ? 'btn-primary' : 'btn-secondary'} 
            style={{ flex: 1, padding: '8px' }} 
            onClick={() => setIsLogin(true)}>Entrar</button>
          <button className={!isLogin ? 'btn-primary' : 'btn-secondary'} 
            style={{ flex: 1, padding: '8px' }} 
            onClick={() => setIsLogin(false)}>Registro</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Nombre completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Tu nombre" />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={loading}>
            {loading ? <span className="spinner"></span> : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn-secondary" style={{ width: '100%', border: '1px dashed var(--border)' }}
            onClick={() => {
              login('demo@colecta.app', 'demo1234')
              router.push('/dashboard')
            }}>
            Entrar como demo →
          </button>
        </div>
      </div>
    </div>
  )
}
