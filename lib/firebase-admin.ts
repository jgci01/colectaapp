import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

// Robust parsing for the private key
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY
const privateKey = rawPrivateKey
  ? rawPrivateKey
      .replace(/^['"]|['"]$/g, '') // Remove surrounding quotes
      .replace(/\\n/g, '\n')       // Handle escaped newlines
  : undefined

const canInitialize = projectId && clientEmail && privateKey && privateKey.includes('PRIVATE KEY')

if (!getApps().length) {
  if (canInitialize) {
    initializeApp({ 
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      })
    })
  } else {
    // En build time o demo mode sin env vars, inicializamos con un placeholder para evitar que getFirestore() explote
    // aunque no funcionará para llamadas reales, permitirá que el build de Next.js pase.
    initializeApp({ projectId: projectId || 'demo-project' })
  }
}

export const adminDb = getFirestore()
export const adminAuth = getAuth()
