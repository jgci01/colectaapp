export type Rol = 'user' | 'admin'

export interface Usuario {
  uid: string; nombre: string; email: string; rol: Rol; creadoEn: string;
}
export interface Pago {
  id: string; usuarioId: string; usuarioNombre: string; monto: number;
  fecha: string; estado: 'pendiente' | 'aprobado' | 'rechazado';
  mpPaymentId: string; mpStatus: string; descripcion?: string;
}
export interface Retiro {
  id: string; adminId: string; adminNombre: string; monto: number;
  fecha: string; motivo: string; comprobante?: string;
}
export interface EstadoColecta {
  nombreColecta: string; montoObjetivo: number; montoRecaudado: number;
  montoRetirado: number; montoDisponible: number; ultimaActualizacion: string;
}
