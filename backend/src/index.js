import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bingoRouter from './routes/bingo.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://bingo-generator-nine.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean)

console.log('✅ CORS origens permitidas:', allowedOrigins)

app.use(cors({
  origin: (origin, callback) => {
    // Sem origin = Postman/curl, sempre permite
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true)
    } else {
      console.warn('🚫 CORS bloqueado para origem:', origin)
      callback(new Error(`CORS: origem não permitida → ${origin}`))
    }
  }
}))

app.use(express.json({ limit: '20mb' }))

app.get('/health', (_, res) => res.json({ ok: true, origins: allowedOrigins }))
app.use('/api/bingo', bingoRouter)

app.listen(PORT, () => {
  console.log(`🎱 Bingo backend rodando em http://localhost:${PORT}`)
})
