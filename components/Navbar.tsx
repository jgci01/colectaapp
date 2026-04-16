'use client'
import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const { perfil, esAdmin, logout } = useAuth()
  const router = useRouter()
  const path = usePathname()

  return (
    <nav className="navbar">
      <span className="navbar-brand">🎯 {process.env.NEXT_PUBLIC_NOMBRE_COLECTA || 'Colecta'}</span>
      <div className="navbar-links">
        {[
          { href: '/dashboard', label: 'Inicio' },
          { href: '/historial', label: 'Historial' },
          ...(esAdmin ? [{ href: '/admin', label: '⚙️ Admin' }] : []),
        ].map(({ href, label }) => (
          <a key={href} href={href} style={{
            fontSize: 14,
            color: path === href ? 'var(--accent)' : 'var(--muted)',
            padding: '6px 12px', borderRadius: 8,
            background: path === href ? 'rgba(200,240,90,0.08)' : 'transparent',
            fontWeight: path === href ? 600 : 400,
          }}>{label}</a>
        ))}
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{perfil?.nombre}</span>
        <button className="btn-secondary" style={{ fontSize: 13, padding: '6px 14px' }}
          onClick={async () => { await logout(); router.push('/') }}>
          Salir
        </button>
      </div>
    </nav>
  )
}
