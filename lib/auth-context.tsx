'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { Usuario } from './types'
import { DEMO_MODE, demoUsuario } from './demo-data'

interface AuthContextType {
  user: User | null; perfil: Usuario | null; loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registrar: (email: string, password: string, nombre: string) => Promise<void>;
  esAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (DEMO_MODE) {
      // En modo demo, simular usuario logueado automáticamente
      setPerfil(demoUsuario)
      setLoading(false)
      return
    }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const snap = await getDoc(doc(db, 'usuarios', u.uid))
        if (snap.exists()) setPerfil(snap.data() as Usuario)
      } else { setPerfil(null) }
      setLoading(false)
    })
  }, [])

  const login = async (email: string, password: string) => {
    if (DEMO_MODE) { setPerfil(demoUsuario); return }
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    if (DEMO_MODE) { setPerfil(null); return }
    await signOut(auth)
  }

  const registrar = async (email: string, password: string, nombre: string) => {
    if (DEMO_MODE) { setPerfil({ ...demoUsuario, nombre }); return }
    const res = await fetch('/api/usuarios/registrar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nombre }),
    })
    if (!res.ok) throw new Error((await res.json()).error)
    await login(email, password)
  }

  return (
    <AuthContext.Provider value={{ user, perfil, loading, login, logout, registrar, esAdmin: perfil?.rol === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
