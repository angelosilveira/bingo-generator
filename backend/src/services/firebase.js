import admin from 'firebase-admin'

if (!admin.apps.length) {
  // O Railway pode entregar a chave com \\n literal ou com \n real.
  // Este tratamento cobre os dois casos.
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || ''
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n')
    : rawKey

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  })
}

export const db = admin.firestore()
