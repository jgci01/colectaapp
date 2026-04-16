// Datos de demostración para el preview local
export const DEMO_MODE = process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-api-key'

export const demoEstado = {
  nombreColecta: 'Colecta del Grupo',
  montoObjetivo: 50000,
  montoRecaudado: 32500,
  montoRetirado: 8000,
  montoDisponible: 24500,
  ultimaActualizacion: new Date().toISOString(),
}

export const demoPagos = [
  { id: '1', usuarioId: 'u1', usuarioNombre: 'María García', monto: 5000, fecha: new Date(Date.now()-86400000*1).toISOString(), estado: 'aprobado', mpPaymentId: 'mp1', mpStatus: 'approved' },
  { id: '2', usuarioId: 'u2', usuarioNombre: 'Juan Pérez', monto: 3000, fecha: new Date(Date.now()-86400000*3).toISOString(), estado: 'aprobado', mpPaymentId: 'mp2', mpStatus: 'approved' },
  { id: '3', usuarioId: 'u3', usuarioNombre: 'Ana Rodríguez', monto: 8000, fecha: new Date(Date.now()-86400000*5).toISOString(), estado: 'aprobado', mpPaymentId: 'mp3', mpStatus: 'approved' },
  { id: '4', usuarioId: 'u4', usuarioNombre: 'Carlos López', monto: 2500, fecha: new Date(Date.now()-86400000*7).toISOString(), estado: 'aprobado', mpPaymentId: 'mp4', mpStatus: 'approved' },
  { id: '5', usuarioId: 'u5', usuarioNombre: 'Laura Martínez', monto: 4000, fecha: new Date(Date.now()-86400000*10).toISOString(), estado: 'aprobado', mpPaymentId: 'mp5', mpStatus: 'approved' },
  { id: '6', usuarioId: 'u6', usuarioNombre: 'Diego Fernández', monto: 10000, fecha: new Date(Date.now()-86400000*12).toISOString(), estado: 'aprobado', mpPaymentId: 'mp6', mpStatus: 'approved' },
]

export const demoRetiros = [
  { id: 'r1', adminId: 'admin1', adminNombre: 'Admin Principal', monto: 5000, motivo: 'Compra de materiales para el evento', fecha: new Date(Date.now()-86400000*4).toISOString() },
  { id: 'r2', adminId: 'admin1', adminNombre: 'Admin Principal', monto: 3000, motivo: 'Pago de servicios de catering', fecha: new Date(Date.now()-86400000*8).toISOString() },
]

export const demoUsuario = {
  uid: 'demo-user',
  nombre: 'Usuario Demo',
  email: 'demo@colecta.app',
  rol: 'admin' as const,
  creadoEn: new Date().toISOString(),
}
