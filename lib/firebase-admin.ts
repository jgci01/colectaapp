import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

/**
 * Normaliza la clave privada para manejar formatos comunes de variables de entorno.
 */
function formatPrivateKey(key: string | undefined) {
  if (!key) return undefined
  return key
    .replace(/^['"]|['"]$/g, '') // Elimina comillas literales al inicio/final
    .replace(/\\n/g, '\n')       // Convierte \n literales en saltos de línea
    .replace(/\r/g, '')          // Elimina retornos de carro
    .trim()
}

const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY)

if (!getApps().length) {
  try {
    // Intentamos inicializar con credenciales reales si están completas
    if (projectId && clientEmail && privateKey && privateKey.includes('PRIVATE KEY')) {
      initializeApp({ 
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        })
      })
    } else {
      // Si faltan datos, usamos una inicialización mínima (útil en build time)
      initializeApp({ projectId: projectId || 'demo-project' })
    }
  } catch (error) {
    // Si cert() falla (ej: ASN.1 error), capturamos para que el build no truene
    console.error('Firebase Admin init failed. Using fallback config.', error)
    if (!getApps().length) {
      initializeApp({ projectId: projectId || 'demo-project' })
    }
  }
}

export const adminDb = getFirestore()
export const adminAuth = getAuth()
